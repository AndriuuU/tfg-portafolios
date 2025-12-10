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
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true
  })
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error al conectar MongoDB:', err.message));
} else {
  console.log('🧪 Modo TEST: MongoDB se configurará desde setup.js');
}

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Backend funcionando ✅ con MongoDB');
});

// Health check endpoint para Railway/Vercel
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date(),
    service: 'TFG Portafolios Backend'
  });
});

// Rutas de la API
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const projectRoutes = require('./routes/projectRoutes');
const followRoutes = require('./routes/followRoutes');
const searchRoutes = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const exportRoutes = require('./routes/exportRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);

const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Arrancar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
