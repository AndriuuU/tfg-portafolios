/**
 * Script para probar Analytics mediante API HTTP
 * Ejecutar: node test-analytics-api.js
 * 
 * Prerequisito: Backend debe estar corriendo en puerto 5000
 */

const API_URL = 'http://localhost:5000/api';

// Credenciales de prueba
let authToken = '';
let user1Id = '';
let user2Id = '';
let project1Id = '';
let project2Id = '';

async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data.token;
  } catch (error) {
    console.error('❌ Error login:', error.message);
    throw error;
  }
}

async function register(username, email, password, name) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, name })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Usuario registrado:', username);
      return data._id;
    }
    if (response.status === 400) {
      console.log('ℹ️  Usuario ya existe:', username);
      return null;
    }
    throw new Error(data.error || 'Registration failed');
  } catch (error) {
    console.error('❌ Error registro:', error.message);
    throw error;
  }
}

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    console.log('✅ Login:', email);
    return {
      token: data.token,
      userId: data.user._id
    };
  } catch (error) {
    console.error('❌ Error login:', error.message);
    throw error;
  }
}

async function createProject(token, title, slug, description) {
  try {
    const response = await fetch(
      `${API_URL}/projects`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, slug, description, tags: ['test', 'analytics'] })
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Create project failed');
    console.log('✅ Proyecto creado:', title);
    return data._id;
  } catch (error) {
    console.error('❌ Error crear proyecto:', error.message);
    throw error;
  }
}

async function getProject(token, projectId) {
  try {
    const response = await fetch(
      `${API_URL}/projects/${projectId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Get project failed');
    console.log('👀 Proyecto visto:', data.title);
    return data;
  } catch (error) {
    console.error('❌ Error obtener proyecto:', error.message);
    throw error;
  }
}

async function likeProject(token, projectId) {
  try {
    const response = await fetch(
      `${API_URL}/projects/${projectId}/like`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Like failed');
    console.log('❤️  Like registrado');
    return data;
  } catch (error) {
    console.error('❌ Error dar like:', error.message);
    throw error;
  }
}

async function addComment(token, projectId, text) {
  try {
    const response = await fetch(
      `${API_URL}/projects/${projectId}/comments`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Comment failed');
    console.log('💬 Comentario añadido');
    return data;
  } catch (error) {
    console.error('❌ Error añadir comentario:', error.message);
    throw error;
  }
}

async function getDashboard(token) {
  try {
    const response = await fetch(
      `${API_URL}/analytics/dashboard`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Dashboard failed');
    return data;
  } catch (error) {
    console.error('❌ Error obtener dashboard:', error.message);
    throw error;
  }
}

async function getAnalytics(token, projectId) {
  try {
    const response = await fetch(
      `${API_URL}/analytics/project/${projectId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Analytics failed');
    return data;
  } catch (error) {
    console.error('❌ Error obtener analytics:', error.message);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🚀 Iniciando pruebas de Analytics\n');
    console.log('========================================\n');

    // 1. Registrar usuarios
    console.log('📝 Registrando usuarios...');
    await register('analyticsuser1', 'analytics1@example.com', 'password123', 'Analytics User 1');
    await register('analyticsuser2', 'analytics2@example.com', 'password123', 'Analytics User 2');

    // 2. Login con ambos usuarios
    console.log('\n🔐 Iniciando sesión...');
    const user1 = await loginUser('analytics1@example.com', 'password123');
    const user2 = await loginUser('analytics2@example.com', 'password123');
    
    const token1 = user1.token;
    const token2 = user2.token;

    // 3. Crear proyectos
    console.log('\n🎨 Creando proyectos...');
    project1Id = await createProject(token1, 'Analytics Test 1', `test-analytics-${Date.now()}-1`, 'Proyecto para probar analytics');
    project2Id = await createProject(token1, 'Analytics Test 2', `test-analytics-${Date.now()}-2`, 'Otro proyecto para probar');

    // 4. Simular interacciones
    console.log('\n🎮 Simulando interacciones...');
    
    // Usuario 2 ve proyecto 1 (3 veces)
    console.log('\n  Usuario 2 viendo Proyecto 1:');
    await getProject(token2, project1Id);
    await getProject(token2, project1Id);
    await getProject(token2, project1Id);

    // Usuario 2 ve proyecto 2 (2 veces)
    console.log('\n  Usuario 2 viendo Proyecto 2:');
    await getProject(token2, project2Id);
    await getProject(token2, project2Id);

    // Usuario 2 da like al proyecto 1
    console.log('\n  Usuario 2 interactuando:');
    await likeProject(token2, project1Id);
    
    // Usuario 2 comenta en proyecto 1
    await addComment(token2, project1Id, 'Excelente trabajo! 🎉');
    
    // Usuario 2 da like al proyecto 2
    await likeProject(token2, project2Id);

    // 5. Obtener estadísticas
    console.log('\n\n📊 ESTADÍSTICAS GENERADAS:');
    console.log('========================================');

    const analytics1 = await getAnalytics(token1, project1Id);
    console.log('\n📈 Proyecto 1: Analytics Test 1');
    console.log('  - Vistas:', analytics1.views || 0);
    console.log('  - Likes:', analytics1.likes || 0);
    console.log('  - Comentarios:', analytics1.comments || 0);
    console.log('  - Engagement:', analytics1.engagement || 0);
    console.log('  - Popularity Score:', analytics1.popularityScore || 0);

    const analytics2 = await getAnalytics(token1, project2Id);
    console.log('\n📈 Proyecto 2: Analytics Test 2');
    console.log('  - Vistas:', analytics2.views || 0);
    console.log('  - Likes:', analytics2.likes || 0);
    console.log('  - Comentarios:', analytics2.comments || 0);
    console.log('  - Engagement:', analytics2.engagement || 0);
    console.log('  - Popularity Score:', analytics2.popularityScore || 0);

    // 6. Dashboard
    console.log('\n\n📊 DASHBOARD DE ESTADÍSTICAS:');
    console.log('========================================');
    const dashboard = await getDashboard(token1);
    console.log('\n📈 Estadísticas Totales:');
    console.log('  - Total de vistas:', dashboard.stats?.totalViews || 0);
    console.log('  - Total de likes:', dashboard.stats?.totalLikes || 0);
    console.log('  - Total de comentarios:', dashboard.stats?.totalComments || 0);
    console.log('  - Total de engagement:', dashboard.stats?.totalEngagement || 0);
    console.log('  - Promedio popularidad:', dashboard.stats?.averagePopularity || 0);
    console.log('  - Número de proyectos:', dashboard.stats?.projectCount || 0);

    console.log('\n\n✅ ¡Pruebas completadas exitosamente!');
    console.log('\n🌐 Accede a http://localhost:5173 > Analytics para ver los datos');
    console.log('   (Inicia sesión con: analytics1@example.com / password123)');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas
runTests();
