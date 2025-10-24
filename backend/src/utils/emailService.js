const nodemailer = require('nodemailer');

// Configurar transporter (usa variables de entorno)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true para puerto 465, false para otros
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verificar configuración
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error en configuración de email:', error);
  } else {
    console.log('✅ Servidor de email listo');
  }
});

// Enviar email de verificación
exports.sendVerificationEmail = async (email, username, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
  
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'TFG Portafolios'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verifica tu cuenta',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${username},</h2>
        <p>Gracias por registrarte en ${process.env.APP_NAME || 'TFG Portafolios'}!</p>
        <p>Para activar tu cuenta, por favor haz click en el siguiente enlace:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verificar Email
        </a>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="color: #666;">${verificationUrl}</p>
        <p>Este enlace expirará en 24 horas.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Si no te registraste en nuestra plataforma, puedes ignorar este email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de verificación enviado a:', email);
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error);
    throw error;
  }
};

// Enviar email de recuperación de contraseña
exports.sendPasswordResetEmail = async (email, username, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
  
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'TFG Portafolios'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperación de contraseña',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${username},</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz click en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Restablecer Contraseña
        </a>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="color: #666;">${resetUrl}</p>
        <p>Este enlace expirará en 1 hora.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de recuperación enviado a:', email);
  } catch (error) {
    console.error('❌ Error enviando email de recuperación:', error);
    throw error;
  }
};

// Enviar email de confirmación de cambio de contraseña
exports.sendPasswordChangedEmail = async (email, username) => {
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'TFG Portafolios'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Contraseña cambiada exitosamente',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${username},</h2>
        <p>Tu contraseña ha sido cambiada exitosamente.</p>
        <p>Si no realizaste este cambio, por favor contacta con soporte inmediatamente.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Este es un mensaje automático, por favor no respondas a este email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmación enviado a:', email);
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error);
  }
};
