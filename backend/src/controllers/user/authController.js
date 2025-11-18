const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const { sendVerificationEmail } = require('../../utils/emailService');

exports.register = async (req, res) => {
  try {
    const { username, email, name, password } = req.body;

    // Validar campos obligatorios
    if (!username || !email || !name || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el username ya existe
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Verificar si el email ya existe
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear usuario
    const newUser = await User.create({
      username,
      email,
      name,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Enviar email de verificación
    try {
      await sendVerificationEmail(email, username, verificationToken);
      console.log('✅ Email de verificación enviado a:', email);
    } catch (emailError) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('❌ Error enviando email de verificación:', emailError);
      }
      // No fallar el registro si el email no se envía
    }

    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
    };

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
      user: userResponse 
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: error.message });
  }
};

//Login
exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    console.log('Login attempt:', { email, username, hasPassword: !!password });

    // Validar que se proporcione email o username y password
    if ((!email && !username) || !password) {
      console.log('Validation failed: missing credentials');
      return res.status(400).json({ error: 'Debes proporcionar email o username y contraseña' });
    }

    // Buscar usuario por email o username
    const user = await User.findOne({ 
      $or: [
        { email: email || '' },
        { username: username || '' }
      ]
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Crear token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        privacy: user.privacy,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

