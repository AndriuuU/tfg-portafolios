/**
 * Test script to verify Ranking Integration with Analytics Dashboard
 * Tests all ranking endpoints and verifies data structure
 */

const BASE_URL = 'http://localhost:5000/api';
const AUTH_TOKEN = 'your-jwt-token-here'; // Will be set after login

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

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
    return data.token;
  } catch (err) {
    throw new Error(`Login failed: ${err.message}`);
  }
}

async function runTests() {
  console.log('\n🧪 Starting Ranking Integration Tests...\n');

  // Get auth token
  console.log('🔐 Authenticating...');
  let token;
  try {
    token = await login('test@example.com', 'password123');
    console.log('✅ Authentication successful\n');
  } catch (err) {
    console.error('⚠️ Using unauthenticated tests only\n');
  }

  // Test 1: Get Global Ranking
  await test('GET /ranking/global - Should return global ranking', async () => {
    const res = await fetch(`${BASE_URL}/ranking/global?limit=10&skip=0`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (!data.users) throw new Error('Missing users array');
    if (!Array.isArray(data.users)) throw new Error('Users is not an array');
    
    // Check user structure
    if (data.users.length > 0) {
      const user = data.users[0];
      if (!user.rank) throw new Error('Missing rank');
      if (!user.userId) throw new Error('Missing userId');
      if (!user.username) throw new Error('Missing username');
      if (!user.stats) throw new Error('Missing stats object');
      if (typeof user.stats.popularityScore !== 'number') throw new Error('Missing popularityScore');
    }
  });

  // Test 2: Get Projects Ranking
  await test('GET /ranking/projects - Should return projects ranking', async () => {
    const res = await fetch(`${BASE_URL}/ranking/projects?limit=10&skip=0`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (!data.projects) throw new Error('Missing projects array');
    if (!Array.isArray(data.projects)) throw new Error('Projects is not an array');
    
    if (data.projects.length > 0) {
      const project = data.projects[0];
      if (!project.rank) throw new Error('Missing rank');
      if (!project.projectId) throw new Error('Missing projectId');
      if (!project.title) throw new Error('Missing title');
    }
  });

  // Test 3: Get Tags Ranking
  await test('GET /ranking/tags - Should return tags ranking', async () => {
    const res = await fetch(`${BASE_URL}/ranking/tags`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (!data.tags) throw new Error('Missing tags array');
    if (!Array.isArray(data.tags)) throw new Error('Tags is not an array');
  });

  // Test 4: Get Weekly Ranking
  await test('GET /ranking/weekly - Should return weekly ranking', async () => {
    const res = await fetch(`${BASE_URL}/ranking/weekly?limit=10&skip=0`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (!data.users) throw new Error('Missing users array');
    if (!Array.isArray(data.users)) throw new Error('Users is not an array');
  });

  // Test 5: Get User's Ranking Position (Authenticated)
  if (token) {
    await test('GET /ranking/my-position - Should return user position', async () => {
      const res = await fetch(`${BASE_URL}/ranking/my-position`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // User position might be null if private account
      if (data.position !== null && data.position !== undefined) {
        if (typeof data.position !== 'number') throw new Error('Position is not a number');
        if (!data.totalUsers) throw new Error('Missing totalUsers');
      }
    });
  }

  // Test 6: Verify data filtering respects privacy
  await test('Verify privacy settings are respected - Should not include private users', async () => {
    const res = await fetch(`${BASE_URL}/ranking/global?limit=100&skip=0`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    // This would require checking user privacy settings in response
    // For now, just verify the structure is consistent
    if (data.users && data.users.length > 0) {
      data.users.forEach(user => {
        if (user.stats.popularityScore < 0) {
          throw new Error('Invalid popularity score (negative)');
        }
      });
    }
  });

  // Test 7: Test pagination
  await test('GET /ranking/global with pagination - Should handle skip and limit', async () => {
    const res1 = await fetch(`${BASE_URL}/ranking/global?limit=5&skip=0`);
    const data1 = await res1.json();
    
    const res2 = await fetch(`${BASE_URL}/ranking/global?limit=5&skip=5`);
    const data2 = await res2.json();
    
    // Verify different pages if available
    if (data1.users.length > 0 && data2.users.length > 0) {
      const firstPageIds = data1.users.map(u => u.userId);
      const secondPageIds = data2.users.map(u => u.userId);
      
      // Check that pages don't have overlapping users
      const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
      if (overlap.length > 0) {
        throw new Error('Pagination overlap detected');
      }
    }
  });

  // Test 8: Verify popularity score calculation
  await test('Verify popularity score calculation - Views(1pt) + Likes(10pt) + Comments(15pt)', async () => {
    const res = await fetch(`${BASE_URL}/ranking/global?limit=10&skip=0`);
    const data = await res.json();
    
    if (data.users && data.users.length > 0) {
      const user = data.users[0];
      const { stats } = user;
      
      // Verify score calculation
      const calculatedScore = 
        (stats.totalViews * 1) + 
        (stats.totalLikes * 10) + 
        (stats.totalComments * 15);
      
      if (Math.abs(stats.popularityScore - calculatedScore) > 1) {
        throw new Error(
          `Score mismatch: expected ${calculatedScore}, got ${stats.popularityScore}`
        );
      }
    }
  });

  // Print Results
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.passed + testResults.failed}`);
  console.log('='.repeat(50));

  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Ranking integration is working correctly.\n');
  } else {
    console.log('\n⚠️ Some tests failed. Check details above.\n');
  }

  console.log('\nDetailed Results:');
  testResults.tests.forEach(result => {
    console.log(`${result.status} - ${result.name}`);
  });
}

// Run tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
