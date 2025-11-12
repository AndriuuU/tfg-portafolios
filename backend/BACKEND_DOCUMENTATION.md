# 📚 Documentación Backend - TFG Portafolios

## 🎯 Visión General

API RESTful para plataforma de portafolios colaborativos con Node.js, Express y MongoDB.

**Stack principal:**
- **Backend:** Node.js + Express 5.1.0
- **Base de datos:** MongoDB + Mongoose 8.10.8
- **Autenticación:** JWT 9.0.2 + bcryptjs 2.4.3
- **Storage:** Cloudinary 2.6.3
- **Email:** Nodemailer 6.9.17
- **Testing:** Jest 29.7.0 (78 tests ✅)

**Características:**
- 🔐 Auth JWT + verificación email
- 👥 Sistema seguimiento público/privado
- 📁 Proyectos colaborativos (viewer/editor)
- 💬 Comentarios y likes
- 🔍 Búsqueda avanzada
- ☁️ Upload de imágenes

## 📂 Estructura

```
backend/src/
├── controllers/
│   ├── user/              # Auth, perfil, avatar, account
│   ├── social/            # Follow, búsqueda
│   ├── project/           # CRUD, comentarios, likes, colaboradores
│   └── emailController.js
├── middleware/            # Auth JWT, upload
├── models/               # User, Project
├── routes/               # Definición de endpoints
├── tests/                # 78 tests con Jest
└── utils/                # Cloudinary, email service
```

## 🗄️ Modelos

### User
```javascript
{
  username: String (único),
  email: String (único),
  password: String (hasheado),
  name: String,
  avatarUrl: String,
  privacy: { isPrivate: Boolean },
  followers: [ObjectId],
  following: [ObjectId],
  followRequests: [ObjectId],
  blockedUsers: [ObjectId],
  savedProjects: [ObjectId],
  emailVerified: Boolean,
  // tokens de verificación y reset
}
```

### Project
```javascript
{
  title: String,
  slug: String (único),
  description: String,
  content: String,
  owner: ObjectId,
  images: [String],
  tags: [String],
  privacy: String ('public'/'private'),
  likes: [ObjectId],
  collaborators: [{
    user: ObjectId,
    role: String, // 'viewer'/'editor'
  }],
  pendingInvitations: [{
    user: ObjectId,
    role: String,
  }],
  comments: [{
    user: ObjectId,
    text: String,
    likes: [ObjectId]
  }]
}
```

## 🎮 Controladores

### 👤 User (`controllers/user/`)

- **authController:** `register`, `login`
- **profileController:** `updateProfile`, `updatePassword`
- **avatarController:** `uploadAvatar`, `deleteAvatar`
- **accountController:** `deleteAccount`

### 👥 Social (`controllers/social/`)

- **followController:** Sistema de seguimiento (público/privado), bloqueos, solicitudes
- **searchController:** Búsqueda de proyectos/usuarios, tags populares

### 📁 Project (`controllers/project/`)

- **projectCrudController:** CRUD completo (create, read, update, delete)
- **commentController:** Añadir, eliminar, likes en comentarios
- **likeController:** Toggle likes en proyectos
- **markerController:** Guardar/quitar proyectos
- **invitationController:** Invitar colaboradores (userId/username/email), aceptar/rechazar
- **collaboratorManagementController:** Listar, eliminar, cambiar rol, abandonar

### 📧 Email

- **emailController:** Verificación email, reset contraseña

## 🛣️ API Endpoints

**Total:** 53 endpoints | **Autenticados:** 37

### `/api/auth` (7 endpoints)
```
POST   /register, /login
PUT    /profile, /password
POST   /avatar (multipart)
DELETE /avatar, /account
```

### `/api/users` (2 endpoints)
```
GET    /:username, /recommended/users
```

### `/api/projects` (24 endpoints)
```
# CRUD
POST   / (multipart), GET /, /:id, /slug/:slug, /saved, /invitations/my
PUT    /:id (multipart)
DELETE /:id

# Interacción
POST   /:id/like, /:id/save, /:id/comments
DELETE /:id/like, /:id/save, /:id/comments/:commentId
POST   /:id/comments/:commentId/like

# Colaboradores
POST   /:id/collaborators/invite, /accept, /reject, /leave
GET    /:id/collaborators
DELETE /:id/collaborators/:userId
PUT    /:id/collaborators/:userId/role
```

### `/api/follow` (13 endpoints)
```
POST   /:userId/follow, /accept-request, /reject-request, /block
DELETE /:userId/unfollow, /unblock, /remove-follower
GET    /:userId/followers, /following, /relationship
GET    /requests, /blocked
PUT    /privacy
```

### `/api/search` (3 endpoints)
```
GET    /projects, /users, /tags/popular
```

### `/api/email` (4 endpoints)
```
GET    /verify/:token
POST   /resend-verification, /request-password-reset, /reset-password
```

## 🔒 Middleware

- **authMiddleware:** Valida JWT en header `Authorization: Bearer <token>`, añade `req.user`
- **upload:** Multer para archivos (max 10MB, imágenes: jpeg/png/gif/webp)

## 🛠️ Utilidades

- **cloudinary.js:** `uploadToCloudinary(buffer, folder)`, `deleteFromCloudinary(publicId)`
- **emailService.js:** `sendVerificationEmail()`, `sendPasswordResetEmail()`

## 🧪 Testing

**Jest + MongoDB Memory Server**

```bash
npm test              # Ejecutar todos
npm run test:coverage # Con cobertura
```

**Suites (78 tests ✅):**
- auth.test.js (13) - Registro, login, perfil
- follow.test.js (15) - Seguimiento, bloqueos
- projects.test.js (20) - CRUD, comentarios, likes
- search.test.js (15) - Búsqueda, filtros, paginación
- models.test.js (14) - Validaciones de User/Project

## 🔐 Variables de Entorno

`.env` en raíz del backend:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=clave_secreta_segura
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=email@gmail.com
EMAIL_PASS=app_password_gmail
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## 🚀 Comandos

```bash
npm install      # Instalar dependencias
npm run dev      # Desarrollo (nodemon)
npm start        # Producción
npm test         # Ejecutar tests
```

## � Características Clave

**Seguridad:**
- Contraseñas hasheadas (bcrypt)
- JWT con expiración 7 días
- Validación de permisos
- Tokens de email con expiración

**Performance:**
- Índices en campos frecuentes
- Populate selectivo
- Paginación en búsquedas
- Límites en resultados

**Arquitectura:**
- Separación por dominios (user/social/project)
- Manejo consistente de errores
- Testing exhaustivo (78 tests)
- Código modular

---

**Versión:** 1.0.0 | **Node.js:** v18+ | **Tests:** 78 ✅
