# TFG Portafolios - Backend

## 🖥️ Descripción

Backend de TFG Portafolios es una API REST robusta construida con **Express.js** y **MongoDB**, diseñada para gestionar todos los aspectos de una plataforma de portafolios digitales.

Este backend proporciona:
- 🔐 Autenticación y gestión de usuarios con JWT
- 📷 Gestión de proyectos y portafolios
- 👥 Sistema social (likes, comentarios, seguimientos)
- 📊 Analytics y estadísticas en tiempo real
- 🏆 Sistema de rankings global
- 🔔 Notificaciones en tiempo real
- 📧 Envío de correos electrónicos con SendGrid
- 📁 Gestión de archivos (Cloudinary)
- 👨‍💼 Panel administrador con gestión de usuarios
- 🚩 Sistema de reportes y moderación
- 📄 Exportación de portafolios a PDF
- 🔍 Búsqueda avanzada de usuarios

---

## 🚀 Empezando

### Requisitos Previos

Antes de comenzar, asegúrate de tener:
- **Node.js** (versión 18.x o superior)
- **npm** (versión 9.x o superior)
- **MongoDB** (local o Atlas)
- **Cloudinary** (cuenta para almacenamiento de imágenes)
- **SendGrid** (para envío de emails transaccionales)

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/AndriuuU/tfg-portafolios.git
   cd tfg-portafolios/backend
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env` en la raíz del directorio `backend`:
   ```env
   # Base de datos
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/tfg-portafolios
   
   # Autenticación
   JWT_SECRET=tu_clave_secreta_muy_larga_aqui
   JWT_EXPIRE=7d
   
   # Cloudinary (imágenes)
   CLOUDINARY_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   
   # SendGrid (emails transaccionales)
   SENDGRID_API_KEY=tu_sendgrid_api_key
   SENDGRID_FROM_EMAIL=noreply@tudominio.com
   
   # Servidor
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Inicia el servidor**
   ```bash
   npm run dev
   ```

   El servidor estará disponible en `http://localhost:5000`

---

## 📦 Scripts Disponibles

### `npm run dev`
Inicia el servidor en modo desarrollo con nodemon (reinicia automáticamente).
```bash
npm run dev
```

### `npm start`
Inicia el servidor en modo producción.
```bash
npm start
```

### `npm test`
Ejecuta todos los tests.
```bash
npm test
```

### `npm run test:watch`
Ejecuta los tests en modo observador (se reinician al cambiar archivos).
```bash
npm run test:watch
```

---

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/              # Lógica de negocio
│   │   ├── authController.js     # Registro, login, autenticación
│   │   ├── userController.js     # Gestión de usuarios
│   │   ├── projectController.js  # Gestión de proyectos
│   │   ├── analyticsController.js# Estadísticas y métricas
│   │   ├── rankingController.js  # Sistema de rankings
│   │   ├── notificationController.js # Notificaciones
│   │   ├── emailController.js    # Envío de emails
│   │   └── ...
│   │
│   ├── routes/                   # Definición de rutas
│   │   ├── authRoutes.js         # Rutas de autenticación
│   │   ├── userRoutes.js         # Rutas de usuarios
│   │   ├── projectRoutes.js      # Rutas de proyectos
│   │   ├── analyticsRoutes.js    # Rutas de analytics
│   │   ├── rankingRoutes.js      # Rutas de rankings
│   │   ├── notificationRoutes.js # Rutas de notificaciones
│   │   └── ...
│   │
│   ├── models/                   # Esquemas MongoDB
│   │   ├── User.js               # Modelo de usuario
│   │   ├── Project.js            # Modelo de proyecto
│   │   ├── Analytics.js          # Modelo de analytics
│   │   ├── ActivityLog.js        # Registro de actividades
│   │   ├── Notification.js       # Modelo de notificaciones
│   │   └── ...
│   │
│   ├── middleware/               # Middlewares Express
│   │   ├── authMiddleware.js     # Verificación JWT
│   │   ├── upload.js             # Configuración de multer
│   │   ├── errorHandler.js       # Manejador de errores
│   │   └── ...
│   │
│   ├── utils/                    # Funciones auxiliares
│   │   ├── emailService.js       # Servicio de correos
│   │   ├── analyticsHelper.js    # Funciones de analytics
│   │   ├── cloudinary.js         # Configuración de Cloudinary
│   │   └── ...
│   │
│   ├── tests/                    # Suite de tests
│   │   ├── analytics.test.js
│   │   ├── auth.test.js
│   │   ├── models.test.js
│   │   └── ...
│   │
│   └── index.js                  # Punto de entrada
│
├── jest.config.js                # Configuración de tests
├── package.json                  # Dependencias y scripts
├── .env                          # Variables de entorno
└── README.md                     # Este archivo
```

---

## 🎨 Características Principales

### 1. **Autenticación (Auth)**
Endpoints:
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/forgot-password` - Recuperar contraseña

### 2. **Gestión de Usuarios**
Endpoints:
- `GET /api/users/:id` - Obtener perfil
- `PUT /api/users/:id` - Actualizar perfil
- `DELETE /api/users/:id` - Eliminar cuenta
- `GET /api/users` - Listar usuarios
- `POST /api/users/:id/follow` - Seguir usuario
- `POST /api/users/:id/block` - Bloquear usuario

### 3. **Gestión de Proyectos**
Endpoints:
- `POST /api/projects` - Crear proyecto
- `GET /api/projects` - Listar proyectos
- `GET /api/projects/:id` - Obtener proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto
- `POST /api/projects/:id/like` - Me gusta
- `POST /api/projects/:id/comment` - Comentar

### 4. **Analytics**
Endpoints:
- `GET /api/analytics/dashboard` - Dashboard personal
- `GET /api/analytics/project/:id` - Estadísticas de proyecto
- `GET /api/analytics/top-projects` - Proyectos más populares
- `GET /api/analytics/activity` - Historial de actividad
- `GET /api/analytics/export` - Exportar datos

### 5. **Rankings**
Endpoints:
- `GET /api/ranking/global` - Ranking global de usuarios
- `GET /api/ranking/projects` - Ranking de proyectos
- `GET /api/ranking/tags` - Ranking de etiquetas
- `GET /api/ranking/weekly` - Ranking semanal
- `GET /api/ranking/my-position` - Mi posición (autenticado)

### 6. **Notificaciones**
Endpoints:
- `GET /api/notifications` - Obtener notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leído
- `DELETE /api/notifications/:id` - Eliminar notificación

### 7. **Búsqueda Avanzada**
Endpoints:
- `GET /api/search/users` - Buscar usuarios por nombre, username o email
- `GET /api/search/projects` - Buscar proyectos
- `GET /api/search/tags` - Buscar etiquetas

### 8. **Panel Administrador**
Endpoints:
- `GET /api/admin/users` - Listar todos los usuarios
- `POST /api/admin/users/:id/promote` - Promocionar a admin
- `POST /api/admin/users/:id/block` - Bloquear usuario
- `GET /api/admin/blocked-accounts` - Ver cuentas bloqueadas
- `POST /api/admin/users/:id/unblock` - Desbloquear usuario
- `GET /api/admin/stats` - Estadísticas globales

### 9. **Sistema de Reportes**
Endpoints:
- `POST /api/reports` - Crear reporte de usuario/proyecto
- `GET /api/admin/reports` - Listar reportes (admin)
- `PUT /api/admin/reports/:id` - Procesar reporte
- `DELETE /api/admin/reports/:id` - Eliminar reporte

### 10. **Exportación**
Endpoints:
- `POST /api/export/pdf` - Exportar portafolio como PDF

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Express.js** | 4.x | Framework web |
| **MongoDB** | Latest | Base de datos NoSQL |
| **Mongoose** | Latest | ODM para MongoDB |
| **JWT** | Latest | Autenticación |
| **Bcrypt** | Latest | Hash de contraseñas |
| **Multer** | Latest | Manejo de archivos |
| **SendGrid** | Latest | Envío de emails transaccionales |
| **Cloudinary** | Latest | Almacenamiento de imágenes |
| **html2pdf.js** | Latest | Generación de PDFs |
| **Jest** | Latest | Testing |
| **Cors** | Latest | Control de CORS |
| **Dotenv** | Latest | Variables de entorno |

---

## 📊 Modelos de Datos

### User
```javascript
{
  _id: ObjectId,
  email: String (único),
  password: String (hasheado),
  username: String (único),
  name: String,
  bio: String,
  avatar: String (URL),
  portfolio: String (URL),
  privacy: {
    isPrivate: Boolean,
    hideEmail: Boolean
  },
  followers: [ObjectId],
  following: [ObjectId],
  blocked: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Project
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  image: String (URL),
  tags: [String],
  userId: ObjectId,
  category: String,
  link: String,
  collaborators: [ObjectId],
  likesCount: Number,
  commentsCount: Number,
  viewsCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Analytics
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  projectId: ObjectId,
  type: String (view|like|comment),
  viewerId: ObjectId,
  timestamp: Date,
  metadata: Object
}
```

### ActivityLog
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  action: String (create|update|delete|like|comment|follow),
  targetId: ObjectId,
  targetType: String (project|user),
  metadata: Object,
  createdAt: Date
}
```

### Report
```javascript
{
  _id: ObjectId,
  reporterId: ObjectId,
  targetId: ObjectId,
  targetType: String (user|project),
  reason: String,
  description: String,
  status: String (pending|reviewed|resolved),
  resolution: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Seguridad

### Implementado
- ✅ Hashing de contraseñas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Validación de entrada
- ✅ Sanitización de datos
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Headers de seguridad
- ✅ SQL/NoSQL injection prevention

### Variables Sensibles en .env
- Nunca subir `.env` a Git
- Usar `.env.example` como referencia
- Regenerar `JWT_SECRET` en producción

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests específicos
npm test analytics.test.js

# Con cobertura
npm test -- --coverage

# Modo observador
npm run test:watch
```

### Archivos de Tests

- `analytics.test.js` - Tests de analytics (35 tests)
- `auth.test.js` - Tests de autenticación
- `models.test.js` - Tests de modelos
- `projects.test.js` - Tests de proyectos
- `search.test.js` - Tests de búsqueda
- `follow.test.js` - Tests de seguimiento

---

## 📈 API Response Format

### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe"
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Respuesta Paginada
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 10,
    "skip": 0,
    "pages": 10
  }
}
```

---

## 🔄 Autenticación

### Flujo JWT

```
1. Usuario hace login
   ↓
2. Servidor verifica credenciales
   ↓
3. Servidor genera JWT token
   ↓
4. Cliente recibe y almacena token
   ↓
5. Cliente envía token en headers
   Authorization: Bearer {token}
   ↓
6. Servidor verifica token en cada petición
   ↓
7. Si válido, permite acceso. Si no, rechaza con 401
```

### Token Payload
```javascript
{
  id: "user_id",
  email: "user@example.com",
  iat: 1234567890,  // Emitido en
  exp: 1234654290   // Expira en
}
```

---

## 📧 Sistema de Emails

### Configuración

1. Crear cuenta en [Mailtrap](https://mailtrap.io)
2. Obtener credenciales SMTP
3. Configurar en `.env`

### Emails Implementados

- Welcome email (bienvenida)
- Password reset (recuperación)
- Verification email (verificación)
- Notification emails (notificaciones)

### Envío Manual
```javascript
const emailService = require('./utils/emailService');

await emailService.sendWelcomeEmail(user.email, user.name);
```

---

## 🖼️ Cloudinary Setup

### Configuración

1. Crear cuenta en [Cloudinary](https://cloudinary.com)
2. Obtener credenciales
3. Configurar en `.env`

### Uso
```javascript
const cloudinary = require('./utils/cloudinary');

const result = await cloudinary.uploader.upload(filePath);
// Retorna URL de la imagen
```

---

## 🐛 Debugging

### Logs

```javascript
// En desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

### MongoDB Queries

```javascript
// Con mongoose debug
mongoose.set('debug', true);
```

### Errores

```javascript
// Middleware de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});
```

---

## 📊 Rendimiento

### Optimizaciones
- ✅ Índices en MongoDB
- ✅ Caché de datos
- ✅ Paginación
- ✅ Agregaciones eficientes
- ✅ Validación de entrada

### Benchmarks
- Respuesta API promedio: < 100ms
- Queries complejas: < 500ms
- Upload de imágenes: < 2s

---

## 🚀 Despliegue

### Opciones

**Heroku**
```bash
heroku create tfg-portafolios
heroku config:set JWT_SECRET=tu_secret
git push heroku main
```

**Railway**
```bash
railway login
railway init
railway up
```

**DigitalOcean**
```bash
# VPS con Node.js
ssh root@your_vps
npm install -g pm2
pm2 start src/index.js
```

**Docker**
```bash
docker build -t tfg-backend .
docker run -p 5000:5000 tfg-backend
```

---

## 📝 Variables de Entorno

### Obligatorias
```env
MONGODB_URI=       # URL de MongoDB
JWT_SECRET=        # Clave secreta JWT
CLOUDINARY_NAME=   # Cloud name de Cloudinary
```

### Opcionales
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DEBUG=false
```

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Abre Pull Request

---

## 📞 Soporte

¿Problemas? Abre un issue en GitHub.

**Equipo Backend**: andresmolinagonz@gmail.com

**Última actualización**: Noviembre 2025

