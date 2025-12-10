/**
 * Test script to verify collaborator functionality
 * Tests: inviting a collaborator, accepting/rejecting, managing roles
 */

const BASE_URL = 'http://localhost:5000/api';
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test users data
const testUser1 = { email: 'test1@example.com', password: 'password123' };
const testUser2 = { email: 'test2@example.com', password: 'password123' };

async function test(name, fn) {
  try {
    await fn();
    testResults.passed++;
    testResults.tests.push({ name, status: '✅ PASSED' });
    console.log(`✅ ${name}`);
  } catch (err) {
    testResults.failed++;
    testResults.tests.push({ name, status: `❌ FAILED: ${err.message}` });
    console.error(`❌ ${name}: ${err.message}`);
  }
}

async function login(email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.token) throw new Error('No token in response');
    return { token: data.token, user: data.user };
  } catch (err) {
    throw new Error(`Login failed: ${err.message}`);
  }
}

async function createProject(token, projectData) {
  const formData = new FormData();
  formData.append('title', projectData.title);
  formData.append('slug', projectData.slug);
  formData.append('description', projectData.description);

  const res = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  if (!data._id) throw new Error('No project ID in response');
  return data;
}

async function runTests() {
  console.log('\n🧪 Testing Collaborator Functionality...\n');

  let token1, user1, token2, user2, projectId;

  // Login as user 1 (project owner)
  await test('Login as User 1 (project owner)', async () => {
    const result = await login(testUser1.email, testUser1.password);
    token1 = result.token;
    user1 = result.user;
    if (!token1 || !user1._id) throw new Error('Missing token or user ID');
  });

  // Login as user 2 (will be invited)
  await test('Login as User 2 (will be invited)', async () => {
    const result = await login(testUser2.email, testUser2.password);
    token2 = result.token;
    user2 = result.user;
    if (!token2 || !user2._id) throw new Error('Missing token or user ID');
  });

  // Create a test project
  await test('Create test project', async () => {
    const project = await createProject(token1, {
      title: 'Collaborator Test Project',
      slug: `test-collab-${Date.now()}`,
      description: 'Project to test collaborator features'
    });
    projectId = project._id;
    console.log(`   Project created: ${projectId}`);
  });

  // Get project and verify owner is populated
  await test('GET /projects/:id returns populated owner', async () => {
    const res = await fetch(`${BASE_URL}/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    const project = await res.json();
    
    if (!project.owner || typeof project.owner === 'string') {
      throw new Error('Owner not populated - received ObjectId string instead of object');
    }
    if (!project.owner._id || !project.owner.username) {
      throw new Error('Owner missing _id or username fields');
    }
    console.log(`   Owner populated: ${project.owner.username}`);
  });

  // Test: Check if owner check works (isOwner should be true)
  await test('Owner can see invite button (permission check)', async () => {
    const res = await fetch(`${BASE_URL}/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    const project = await res.json();
    
    // Simulate the isOwner check from ProjectDetail.jsx
    const isOwner = user1._id === project.owner._id || user1.id === project.owner._id;
    if (!isOwner) {
      throw new Error(`Permission check failed: user1._id=${user1._id}, owner._id=${project.owner._id}`);
    }
    console.log(`   Owner recognized correctly: isOwner=${isOwner}`);
  });

  // Test: Invite collaborator
  await test('Invite User 2 as collaborator (viewer)', async () => {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/collaborators/invite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token1}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: user2.username,
        role: 'viewer'
      })
    });
    const data = await res.json();
    if (res.status !== 201) {
      throw new Error(`Unexpected status: ${res.status}, message: ${data.error || data.message}`);
    }
    console.log(`   Invitation sent to ${user2.username}`);
  });

  // Test: Get collaborators (should be empty before acceptance)
  await test('GET /projects/:id/collaborators returns empty (pending)', async () => {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/collaborators`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    const data = await res.json();
    if (data.collaborators && data.collaborators.length > 0) {
      throw new Error('Collaborators list should be empty before acceptance');
    }
  });

  // Test: Get pending invitations for user 2
  await test('User 2 has pending invitation', async () => {
    const res = await fetch(`${BASE_URL}/projects/invitations/my`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    const data = await res.json();
    const invitation = data.invitations.find(inv => inv.project._id === projectId);
    if (!invitation) {
      throw new Error('User 2 should have pending invitation');
    }
    console.log(`   Invitation found, role: ${invitation.role}`);
  });

  // Test: Accept invitation
  await test('User 2 accepts invitation', async () => {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/collaborators/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    const data = await res.json();
    if (res.status !== 200) {
      throw new Error(`Failed to accept: ${data.error || data.message}`);
    }
    console.log(`   Invitation accepted`);
  });

  // Test: Collaborators list now includes user 2
  await test('User 2 is now in collaborators list', async () => {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/collaborators`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    const data = await res.json();
    const collab = data.collaborators.find(c => c.user._id === user2._id);
    if (!collab) {
      throw new Error('User 2 not found in collaborators list');
    }
    if (collab.role !== 'viewer') {
      throw new Error(`Expected role 'viewer', got '${collab.role}'`);
    }
    console.log(`   User 2 is collaborator with role: ${collab.role}`);
  });

  // Test: Update collaborator role to editor
  await test('Update User 2 role to editor', async () => {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/collaborators/${user2._id}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token1}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'editor' })
    });
    const data = await res.json();
    if (res.status !== 200) {
      throw new Error(`Failed to update role: ${data.error || data.message}`);
    }
    console.log(`   Role updated to editor`);
  });

  // Test: Remove collaborator
  await test('Remove User 2 as collaborator', async () => {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/collaborators/${user2._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    const data = await res.json();
    if (res.status !== 200) {
      throw new Error(`Failed to remove: ${data.error || data.message}`);
    }
    console.log(`   User 2 removed as collaborator`);
  });

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log('='.repeat(60) + '\n');

  if (testResults.failed === 0) {
    console.log('🎉 All tests passed! Collaborator functionality is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. See details above.\n');
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
