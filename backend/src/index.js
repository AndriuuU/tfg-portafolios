const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB SOLO si NO estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error al conectar MongoDB:', err));
} else {
  console.log('🧪 Modo TEST: MongoDB se configurará desde setup.js');
}

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Backend funcionando ✅ con MongoDB');
});

// Rutas de la API
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const projectRoutes = require('./routes/projectRoutes');
const followRoutes = require('./routes/followRoutes');
const searchRoutes = require('./routes/searchRoutes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/search', searchRoutes);

// Arrancar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
