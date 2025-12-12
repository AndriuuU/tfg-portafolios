const nodemailer = require('nodemailer');

let transporter = null;

// Inicializar transporter con Ethereal Email (sin restricciones)
async function initializeTransporter() {
  if (transporter) return transporter;
  
  try {
    // Crear cuenta de prueba en Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('✅ Email configurado con Ethereal (Testing)');
    console.log('📧 Usuario:', testAccount.user);
    console.log('🔑 Contraseña:', testAccount.pass);
    console.log('📨 Ver emails en: https://ethereal.email');
    
    return transporter;
  } catch (error) {
    console.error('❌ Error inicializando email:', error.message);
    throw error;
  }
}

// Inicializar al cargar
initializeTransporter().catch(err => {
  console.error('⚠️ Error en inicialización de email:', err.message);
});

// Enviar email de verificación
exports.sendVerificationEmail = async (email, username, token) => {
  if (process.env.NODE_ENV === 'test') {
    console.log('🧪 TEST: Email de verificación enviado a:', email);
    return;
  }

  try {
    const tp = await initializeTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
    
    const mailOptions = {
      from: 'noreply@portafolioshub.com',
      to: email,
      subject: 'Verifica tu cuenta - PortafoliosHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hola ${username},</h2>
          <p>Gracias por registrarte en PortafoliosHub!</p>
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

    const info = await tp.sendMail(mailOptions);
    console.log('✅ Email de verificación enviado a:', email);
    console.log('📨 Vista previa:', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error.message);
    throw error;
  }
};

// Enviar email de recuperación de contraseña
exports.sendPasswordResetEmail = async (email, username, token) => {
  try {
    const tp = await initializeTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    
    const mailOptions = {
      from: 'noreply@portafolioshub.com',
      to: email,
      subject: 'Recuperación de contraseña - PortafoliosHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hola ${username},</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Haz click en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Restablecer Contraseña
          </a>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p>Este enlace expirará en 1 hora.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
        </div>
      `,
    };

    const info = await tp.sendMail(mailOptions);
    console.log('✅ Email de recuperación enviado a:', email);
    console.log('📨 Vista previa:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('❌ Error enviando email de recuperación:', error.message);
    throw error;
  }
};

// Enviar email de confirmación de cambio de contraseña
exports.sendPasswordChangedEmail = async (email, username) => {
  try {
    const tp = await initializeTransporter();
    
    const mailOptions = {
      from: 'noreply@portafolioshub.com',
      to: email,
      subject: 'Contraseña cambiada exitosamente - PortafoliosHub',
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

    const info = await tp.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Email de confirmación enviado a:', email);
      console.log('📨 Vista previa:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Error enviando email de confirmación:', error.message);
    }
  }
};

// Enviar email de notificación de cambio de email
exports.sendEmailChangedNotification = async (oldEmail, newEmail, username) => {
  try {
    const tp = await initializeTransporter();
    
    const mailOptions = {
      from: 'noreply@portafolioshub.com',
      to: oldEmail,
      subject: 'Tu email ha sido cambiado - PortafoliosHub',
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

    // Enviar al email antiguo
    const info1 = await tp.sendMail(mailOptions);
    console.log('📨 Vista previa antiguo:', nodemailer.getTestMessageUrl(info1));
    
    // También enviar al nuevo email
    const newMailOptions = {
      from: 'noreply@portafolioshub.com',
      to: newEmail,
      subject: 'Email actualizado correctamente - PortafoliosHub',
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
    const info2 = await tp.sendMail(newMailOptions);
    console.log('📨 Vista previa nuevo:', nodemailer.getTestMessageUrl(info2));
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Email de notificación de cambio enviado a:', oldEmail, 'y', newEmail);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Error enviando email de notificación de cambio:', error.message);
    }
  }
};
    
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
  try {
    const tp = await initializeTransporter();
    
    const mailOptions = {
      from: 'noreply@portafolioshub.com',
      to: email,
      subject: 'Nombre de usuario cambiado - PortafoliosHub',
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

    const info = await tp.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Email de cambio de username enviado a:', email);
      console.log('📨 Vista previa:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Error enviando email de cambio de username:', error.message);
    }
  }
};

// Enviar email de resumen de cambios en el perfil
exports.sendProfileUpdateEmail = async (email, username, changes) => {
  try {
    const tp = await initializeTransporter();
    
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

    const mailOptions = {
      from: 'noreply@portafolioshub.com',
      to: email,
      subject: 'Tu perfil ha sido actualizado - PortafoliosHub',
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

    const info = await tp.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Email de actualización de perfil enviado a:', email);
      console.log('📨 Vista previa:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Error enviando email de actualización:', error.message);
    }
  }
};
