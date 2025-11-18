// Script de prueba para el servicio de email
const http = require('http');

const AUTH_URL = 'http://localhost:5000/api/auth';
const EMAIL_URL = 'http://localhost:5000/api/email';

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testEmailService() {
  console.log('🧪 Probando servicio de email con rutas separadas...\n');

  try {
    // Test 1: Registrar un nuevo usuario
    console.log('📝 Test 1: Registrando nuevo usuario...');
    const timestamp = Date.now();
    const response = await makeRequest(`${AUTH_URL}/register`, {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`, // Email único
      name: 'Usuario de Prueba',
      password: 'Test123456!'
    });

    if (response.status === 201) {
      console.log('✅ Usuario registrado:', response.data);
    } else {
      console.log('⚠️  Respuesta:', response.data);
    }

    // Test 2: Solicitar recuperación de contraseña (nueva ruta /api/email)
    console.log('\n📝 Test 2: Solicitando recuperación de contraseña...');
    const forgotResponse = await makeRequest(`${EMAIL_URL}/forgot-password`, {
      email: 'portafoliohubtfg@gmail.com' // Enviar a tu email real
    });

    if (forgotResponse.status === 200) {
      console.log('✅ Email de recuperación enviado');
      console.log('\n📧 Revisa tu email en: portafoliohubtfg@gmail.com');
      console.log('📌 Deberías recibir un email para restablecer contraseña');
      console.log('📍 Rutas actualizadas:');
      console.log('   - Autenticación: /api/auth/*');
      console.log('   - Email: /api/email/*\n');
    } else {
      console.log('⚠️  Respuesta:', forgotResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmailService();
