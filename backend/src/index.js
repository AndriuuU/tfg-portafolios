const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes'); // importa las rutas

const app = express(); // 👈 primero creamos app

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar MongoDB:', err));

// Rutas
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Backend funcionando ✅ con MongoDB');
});

// Arrancar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

// Rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rutas de proyectos
const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);

// Rutas de seguidores
const followRoutes = require('./routes/followRoutes');
app.use('/api/follow', followRoutes);
