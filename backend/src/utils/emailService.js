const sgMail = require('@sendgrid/mail');

// Configurar SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid configurado correctamente');
} else {
  console.warn('⚠️ SENDGRID_API_KEY no está definida');
}

// Enviar email de verificación
exports.sendVerificationEmail = async (email, username, token) => {
  if (process.env.NODE_ENV === 'test') {
    console.log('🧪 TEST: Email de verificación enviado a:', email);
    return;
  }

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
  
  const msg = {
    to: email,
    from: process.env.EMAIL_USER || 'noreply@portafolioshub.com',
    subject: 'Verifica tu cuenta - TFG Portafolios',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${username},</h2>
        <p>Gracias por registrarte en ${process.env.APP_NAME || 'TFG Portafolios'}!</p>
        <p>Para activar tu cuenta, por favor haz click en el siguiente enlace:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verificar Email
        </a>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p>Este enlace expirará en 24 horas.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Si no te registraste en nuestra plataforma, puedes ignorar este email.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email de verificación enviado a:', email);
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error.message);
    throw error;
  }
};

// Enviar email de recuperación de contraseña
exports.sendPasswordResetEmail = async (email, username, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
  
  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
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
    await sgMail.send(msg);
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Email de recuperación enviado a:', email);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Error enviando email de recuperación:', error.message);
    }
    throw error;
  }
};

// Enviar email de confirmación de cambio de contraseña
exports.sendPasswordChangedEmail = async (email, username) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
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
    await sgMail.send(msg);
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Email de confirmación enviado a:', email);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Error enviando email de confirmación:', error.message);
    }
  }
};

// Enviar email de notificación de cambio de email
exports.sendEmailChangedNotification = async (oldEmail, newEmail, username) => {
  const msg = {
    to: oldEmail,
    from: process.env.EMAIL_USER,
    subject: 'Tu email ha sido cambiado',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${username},</h2>
        <p>Tu email de contacto ha sido cambiado exitosamente.</p>
        <p><strong>Nuevo email:</strong> ${newEmail}</p>
        <p>Si no realizaste este cambio, por favor contacta con soporte inmediatamente.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Este es un mensaje automático, por favor no respondas a este email.</p>
      </div>
    `,
  };

  try {
    // Enviar al email antiguo
    await sgMail.send(msg);
    
    // También enviar al nuevo email
    const newMsg = {
      to: newEmail,
      from: process.env.EMAIL_USER,
      subject: 'Email actualizado correctamente',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hola ${username},</h2>
          <p>Tu email de contacto ha sido actualizado exitosamente a esta dirección.</p>
          <p>Ahora recibirás todas las notificaciones en este email.</p>
          <p>Si no realizaste este cambio, por favor contacta con soporte inmediatamente.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Este es un mensaje automático, por favor no respondas a este email.</p>
        </div>
      `,
    };
    await sgMail.send(newMsg);
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Email de notificación de cambio enviado a:', oldEmail, 'y', newEmail);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Error enviando email de notificación de cambio:', error.message);
    }
  }
};

// Enviar email de notificación de cambio de nombre de usuario
exports.sendUsernameChangedEmail = async (email, oldUsername, newUsername) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Nombre de usuario cambiado',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${newUsername},</h2>
        <p>Tu nombre de usuario ha sido cambiado exitosamente.</p>
        <p><strong>Usuario anterior:</strong> ${oldUsername}</p>
        <p><strong>Usuario nuevo:</strong> ${newUsername}</p>
        <p>Si no realizaste este cambio, por favor contacta con soporte inmediatamente.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Este es un mensaje automático, por favor no respondas a este email.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Email de cambio de username enviado a:', email);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Error enviando email de cambio de username:', error.message);
    }
  }
};

// Enviar email de resumen de cambios en el perfil
exports.sendProfileUpdateEmail = async (email, username, changes) => {
  const changesList = Object.entries(changes)
    .map(([field, value]) => {
      const fieldNames = {
        name: 'Nombre completo',
        username: 'Nombre de usuario',
        email: 'Email',
        password: 'Contraseña',
        avatar: 'Foto de perfil'
      };
      return `<li><strong>${fieldNames[field] || field}:</strong> ${value}</li>`;
    })
    .join('');

  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Tu perfil ha sido actualizado',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${username},</h2>
        <p>Se han realizado cambios en tu perfil:</p>
        <ul style="line-height: 1.8;">
          ${changesList}
        </ul>
        <p>Si no realizaste estos cambios, por favor contacta con soporte inmediatamente.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Este es un mensaje automático, por favor no respondas a este email.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Email de actualización de perfil enviado a:', email);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Error enviando email de actualización:', error.message);
    }
  }
};
