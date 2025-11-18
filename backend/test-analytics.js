/**
 * Script para probar Analytics - Genera datos de prueba
 * Ejecutar: node test-analytics.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');
const Project = require('./src/models/Project');
const Analytics = require('./src/models/Analytics');
const ActivityLog = require('./src/models/ActivityLog');
const {
  logProjectView,
  logProjectLike,
  logProjectComment,
  logActivity
} = require('./src/utils/analyticsHelper');

async function testAnalytics() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tfg-portafolios';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB:', mongoUri);

    // Crear usuarios de prueba
    console.log('\n📝 Creando usuarios de prueba...');
    const user1 = await User.findOne({ email: 'test1@example.com' }) || 
      await User.create({
        username: 'testuser1',
        email: 'test1@example.com',
        name: 'Test User 1',
        password: 'password123',
        isEmailVerified: true
      });
    console.log('✅ Usuario 1:', user1.username);

    const user2 = await User.findOne({ email: 'test2@example.com' }) || 
      await User.create({
        username: 'testuser2',
        email: 'test2@example.com',
        name: 'Test User 2',
        password: 'password123',
        isEmailVerified: true
      });
    console.log('✅ Usuario 2:', user2.username);

    // Crear proyectos de prueba
    console.log('\n🎨 Creando proyectos de prueba...');
    const project1 = await Project.findOne({ slug: 'test-project-1' }) ||
      await Project.create({
        owner: user1._id,
        title: 'Test Project 1',
        slug: 'test-project-1',
        description: 'Proyecto de prueba 1 para analytics',
        tags: ['test', 'analytics']
      });
    console.log('✅ Proyecto 1:', project1.title);

    const project2 = await Project.findOne({ slug: 'test-project-2' }) ||
      await Project.create({
        owner: user1._id,
        title: 'Test Project 2',
        slug: 'test-project-2',
        description: 'Proyecto de prueba 2 para analytics',
        tags: ['test', 'analytics']
      });
    console.log('✅ Proyecto 2:', project2.title);

    // Simular interacciones
    console.log('\n👀 Simulando vistas...');
    await logProjectView(project1._id, user2._id);
    await logProjectView(project1._id, user2._id); // Vista duplicada (mismo usuario)
    await logProjectView(project1._id, null); // Vista anónima
    await logProjectView(project2._id, user2._id);
    console.log('✅ 4 vistas registradas');

    console.log('\n❤️  Simulando likes...');
    await logProjectLike(project1._id, user2._id);
    await logProjectLike(project2._id, user2._id);
    await logActivity(user2._id, 'project_liked', {
      projectId: project1._id,
      projectTitle: project1.title
    });
    console.log('✅ 2 likes registrados');

    console.log('\n💬 Simulando comentarios...');
    await logProjectComment(project1._id);
    await logProjectComment(project1._id);
    await logProjectComment(project2._id);
    await logActivity(user2._id, 'comment_added', {
      projectId: project1._id,
      projectTitle: project1.title,
      description: 'Comentó: Gran trabajo!'
    });
    console.log('✅ 3 comentarios registrados');

    // Obtener estadísticas
    console.log('\n📊 Estadísticas generadas:');
    console.log('========================================');

    const analytics1 = await Analytics.findOne({ projectId: project1._id });
    console.log('\nProyecto 1:', project1.title);
    console.log('  - Vistas:', analytics1?.views?.total || 0);
    console.log('  - Vistas únicas:', analytics1?.views?.unique_viewers?.length || 0);
    console.log('  - Likes:', analytics1?.likes?.total || 0);
    console.log('  - Comentarios:', analytics1?.comments?.total || 0);
    console.log('  - Engagement:', analytics1?.engagement?.interactions || 0);
    console.log('  - Popularity Score:', analytics1?.popularityScore || 0);

    const analytics2 = await Analytics.findOne({ projectId: project2._id });
    console.log('\nProyecto 2:', project2.title);
    console.log('  - Vistas:', analytics2?.views?.total || 0);
    console.log('  - Vistas únicas:', analytics2?.views?.unique_viewers?.length || 0);
    console.log('  - Likes:', analytics2?.likes?.total || 0);
    console.log('  - Comentarios:', analytics2?.comments?.total || 0);
    console.log('  - Engagement:', analytics2?.engagement?.interactions || 0);
    console.log('  - Popularity Score:', analytics2?.popularityScore || 0);

    // Obtener actividad
    console.log('\n📝 Actividades registradas:');
    const activities = await ActivityLog.find({ userId: user2._id }).limit(5);
    activities.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.action}: ${activity.details?.description || ''}`);
    });

    console.log('\n✅ Test completado correctamente');
    console.log('\n🌐 Accede a http://localhost:5173 para ver los datos en el Dashboard de Analytics');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  }
}

testAnalytics();
