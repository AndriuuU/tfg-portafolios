const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Conectar a MongoDB en memoria antes de todos los tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

// Limpiar la base de datos después de cada test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Desconectar y cerrar después de todos los tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
