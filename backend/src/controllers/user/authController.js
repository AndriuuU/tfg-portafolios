const authService = require('../../services/authService');

exports.register = async (req, res, next) => {
  try {
    const { username, email, name, password } = req.body;

    // Validación básica de entrada
    if (!username || !email || !name || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Delegar lógica de negocio al servicio
    const user = await authService.registerUser({ username, email, name, password });

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
      user 
    });
  } catch (error) {
    // Manejo de errores específicos
    if (error.message === 'USERNAME_EXISTS') {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    console.error('Error en register:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Validación básica de entrada
    if ((!email && !username) || !password) {
      return res.status(400).json({ error: 'Debes proporcionar email o username y contraseña' });
    }

    // Delegar autenticación al servicio
    const user = await authService.loginUser({ email, username, password });
    
    // Verificar estado de la cuenta ANTES de generar el token
    if (user.isDeleted) {
      return res.status(403).json({ 
        error: 'Tu cuenta ha sido eliminada',
        reason: user.deletedReason || 'Violación de las políticas de la comunidad',
        type: 'ACCOUNT_DELETED'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ 
        error: 'Tu cuenta ha sido baneada permanentemente',
        reason: user.banReason || 'Violación grave de las políticas',
        type: 'ACCOUNT_BANNED'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({ 
        error: 'Tu cuenta ha sido suspendida temporalmente',
        reason: user.suspensionReason || 'Actividad sospechosa o violación de políticas',
        type: 'ACCOUNT_SUSPENDED'
      });
    }
    
    // Generar token solo si la cuenta está activa
    const token = authService.generateToken(user);

    res.json({
      message: "Login exitoso",
      token,
      user: authService.serializeUser(user),
    });
  } catch (error) {
    // Manejo de errores específicos
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    if (error.message === 'INVALID_PASSWORD') {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    
    console.error('Error en login:', error);
    next(error);
  }
};

