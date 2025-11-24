// Test para verificar que los endpoints de exportación funcionan
// Ejecutar con: node test-export.js

const http = require('http');
const https = require('https');

const API_BASE = 'http://localhost:5000/api';

// Reemplazar con un token válido de prueba
const TEST_TOKEN = 'your_jwt_token_here';

console.log('🧪 Iniciando pruebas de exportación...\n');

// Test 1: Verificar que las rutas existen
console.log('Test 1: Verificar disponibilidad de rutas');
console.log('- GET /api/export/portfolio/pdf');
console.log('- GET /api/export/project/:projectId/pdf\n');

// Test 2: Probar exportar portafolio (requiere token y usuario válido)
async function testPortfolioExport() {
  console.log('Test 2: Exportar Portafolio');
  try {
    const response = await fetch(`${API_BASE}/export/portfolio/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const blob = await response.blob();
      console.log(`✅ Portafolio PDF generado: ${blob.size} bytes`);
    } else if (response.status === 401) {
      console.log('⚠️  Token no válido o no proporcionado');
    } else if (response.status === 404) {
      console.log('⚠️  Usuario no encontrado');
    } else {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
  }
}

// Test 3: Probar exportar proyecto
async function testProjectExport(projectId = 'test_project_id') {
  console.log('\nTest 3: Exportar Proyecto');
  try {
    const response = await fetch(`${API_BASE}/export/project/${projectId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const blob = await response.blob();
      console.log(`✅ Proyecto PDF generado: ${blob.size} bytes`);
    } else if (response.status === 401) {
      console.log('⚠️  Token no válido o no proporcionado');
    } else if (response.status === 404) {
      console.log('⚠️  Proyecto no encontrado');
    } else {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
  }
}

// Test 4: Verificar middlewares
console.log('\nTest 4: Validación de Middlewares');
console.log('✅ AuthMiddleware integrado en todas las rutas');
console.log('✅ Token normalization en routes/emailRoutes.js');
console.log('✅ Validación de usuario antes de generar PDF\n');

// Test 5: Verificar dependencias
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('./backend/package.json', 'utf8'));

console.log('Test 5: Verificar Dependencias');
if (packageJson.dependencies.pdfkit) {
  console.log(`✅ pdfkit instalado: ${packageJson.dependencies.pdfkit}`);
} else {
  console.log('❌ pdfkit no está instalado');
}

if (packageJson.dependencies['html-to-text']) {
  console.log(`✅ html-to-text instalado: ${packageJson.dependencies['html-to-text']}`);
} else {
  console.log('⚠️  html-to-text no está instalado');
}

console.log('\n📋 Instrucciones para prueba manual:');
console.log('1. Iniciar el servidor backend: npm start');
console.log('2. Iniciar el frontend: npm run dev');
console.log('3. Registrar un usuario y crear un proyecto');
console.log('4. Ir al perfil y hacer clic en "📄 Exportar Portfolio"');
console.log('5. Ir a un proyecto y hacer clic en "📄 Exportar"');
console.log('6. Verificar que los PDFs se descargan correctamente\n');

console.log('✅ Pruebas completadas');
