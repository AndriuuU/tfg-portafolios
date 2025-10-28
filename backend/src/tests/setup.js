const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Conectar a MongoDB en memoria antes de todos los tests
beforeAll(async () => {
  // ⚠️ IMPORTANTE: Desconectar cualquier conexión existente antes de tests
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // ✅ Verificar que estamos usando MongoDB en memoria
  console.log('🧪 Tests usando MongoDB en memoria:', mongoUri);
  
  await mongoose.connect(mongoUri);
});

// Limpiar la base de datos después de cada test
afterEach(async () => {
  // 🛡️ PROTECCIÓN: Solo borrar datos si estamos en MongoDB Memory Server
  const currentUri = mongoose.connection.host;
  
  if (!currentUri || currentUri.includes('127.0.0.1') || currentUri.includes('localhost')) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  } else {
    console.error('❌ PELIGRO: Intentando borrar base de datos real. Tests abortados.');
    throw new Error('Tests intentando usar base de datos de producción');
  }
});

// Desconectar y cerrar después de todos los tests
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
