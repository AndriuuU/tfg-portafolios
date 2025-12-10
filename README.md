# 🎨 TFG Portafolios

## Descripción del Proyecto

**TFG Portafolios** es una plataforma web moderna y completa para crear, compartir y descubrir portafolios digitales. Es un proyecto de Trabajo Fin de Grado (TFG) que integra tecnologías fullstack modernas para ofrecer una experiencia de usuario profesional.

Esta plataforma permite a creativos, diseñadores, desarrolladores y profesionales en general:

- 📸 **Crear portafolios** profesionales y personalizados
- 🌍 **Compartir su trabajo** con la comunidad global
- 👥 **Conectar** con otros creativos y colaboradores
- 💬 **Interactuar** mediante likes, comentarios y seguimientos
- 📊 **Analizar** el rendimiento de sus proyectos en detalle
- 🏆 **Competir** en rankings globales
- 🔔 **Recibir notificaciones** de interacciones

---

## ✨ Características Principales

### 🔐 Autenticación Segura
- Registro e inicio de sesión
- Recuperación de contraseña por email
- Tokens JWT con expiración
- Contraseñas hasheadas con bcrypt

### 👤 Gestión de Perfiles
- Edición de perfil personalizable
- Avatar y portada personalizables
- Configuración de privacidad
- Seguimiento bidireccional de usuarios
- Sistema de bloqueo de usuarios

### 🎯 Portafolios y Proyectos
- Crear y gestionar proyectos
- Subida de imágenes (Cloudinary)
- Categorización de proyectos
- Etiquetado automático
- Descripción completa con markdown
- Información de colaboradores

### 💬 Interacción Social
- Sistema de likes/me gusta
- Comentarios en proyectos
- Respuestas a comentarios
- Menciones de usuarios
- Sistema de seguimiento

### 📊 Analytics y Estadísticas
- Dashboard personalizado
- Métricas de proyectos
- Gráficos de actividad
- Análisis de engagement
- Exportación de datos
- Historial de actividad

### 🏆 Sistema de Rankings
- Ranking global de usuarios
- Ranking de proyectos
- Rankings por categoría
- Rankings semanales
- Cálculo de puntuación basado en interacciones
- Respeto a la privacidad de usuarios

### 🔔 Notificaciones
- Sistema de notificaciones en tiempo real
- Campana de notificaciones
- Historial de notificaciones
- Marca como leído/no leído
- Diferentes tipos de notificaciones

### 👨‍💼 Panel Administrador
- Dashboard administrativo completo
- Gestión de usuarios bloqueados
- Sistema de reportes de usuarios
- Moderación de contenido
- Estadísticas globales de la plataforma

### 🔍 Búsqueda de Usuarios
- Búsqueda avanzada de usuarios
- Filtrado por nombre, username o email
- Perfiles públicos de usuarios
- Paginación de resultados
- Visitas a perfiles de otros usuarios

### 📥 Exportación de Portafolios
- Exportar portafolio como PDF
- Incluye todos los proyectos
- Diseño profesional en el PDF
- Descarga directa

### 🌙 Diseño Responsive
- Mobile-first design
- Modo oscuro y claro con CSS variables
- Totalmente responsive (mobile, tablet, desktop)
- Optimizado para todos los dispositivos
- Contraste de colores accesible

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Librería UI
- **Vite** - Bundler y dev server
- **Axios** - Cliente HTTP
- **React Router** - Enrutamiento
- **SCSS** - Estilos con preprocesador
- **Cloudinary SDK** - Gestión de imágenes

### Backend
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas
- **Multer** - Manejo de archivos
- **SendGrid** - Servicio de envío de emails (SMTP)
- **Jest** - Testing
- **html2pdf.js** - Generación de PDFs

### Infraestructura y Despliegue
- **Node.js** - Runtime JavaScript
- **npm** - Gestor de dependencias
- **Git** - Control de versiones
- **Cloudinary** - Almacenamiento de imágenes en la nube
- **SendGrid** - API para envío de emails transaccionales
- **MongoDB Atlas** - Base de datos en la nube
- **Railway** - Hosting del backend Node.js
- **Netlify** - Hosting del frontend React

---

## 🚀 Acceso a la Plataforma

### 🌐 Frontend (Aplicación Web)
```
https://portafolioshub.netlify.app/
```

### 🔌 Backend (API REST)
```
https://tfg-portafolios-production.up.railway.app
API Endpoint: https://tfg-portafolios-production.up.railway.app/api
```

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18.x o superior)
- **npm** (versión 9.x o superior)
- **MongoDB** (local o MongoDB Atlas)
- **Git**

Cuentas externas requeridas:
- **Cloudinary** (para almacenamiento de imágenes)
- **SendGrid** (para envío de emails transaccionales)
- **MongoDB Atlas** (base de datos en la nube, opcional si usas MongoDB local)

---

## 🚀 Instalación y Setup

### 1. Clonar el Repositorio

```bash
git clone https://github.com/AndriuuU/tfg-portafolios.git
cd tfg-portafolios
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cat > .env << EOF
# Base de datos
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/tfg-portafolios

# Autenticación
JWT_SECRET=tu_clave_secreta_muy_larga_aqui

# Cloudinary (imágenes)
CLOUDINARY_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# SendGrid (emails)
SENDGRID_API_KEY=tu_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@tudominio.com

# Servidor
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF

# Iniciar servidor
npm run dev
```

El backend estará disponible en `http://localhost:5000`

### 3. Configurar Frontend

```bash
cd ../fronted

# Instalar dependencias
npm install

# Crear archivo .env
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## 📂 Estructura del Proyecto

```
tfg-portafolios/
│
├── backend/                      # API REST (Express + MongoDB)
│   ├── src/
│   │   ├── controllers/          # Lógica de negocio
│   │   ├── routes/               # Definición de rutas
│   │   ├── models/               # Esquemas MongoDB
│   │   ├── middleware/           # Middlewares Express
│   │   ├── utils/                # Funciones auxiliares
│   │   ├── tests/                # Suite de tests
│   │   └── index.js              # Punto de entrada
│   ├── package.json
│   ├── jest.config.js
│   ├── .env                      # Variables de entorno (no subir)
│   └── README.md                 # Documentación del backend
│
├── fronted/                      # Aplicación React (Vite)
│   ├── src/
│   │   ├── api/                  # Configuración de API
│   │   ├── components/           # Componentes reutilizables
│   │   ├── pages/                # Páginas principales
│   │   ├── context/              # Context API
│   │   ├── styles/               # Estilos SCSS
│   │   ├── App.jsx               # Componente raíz
│   │   └── main.jsx              # Punto de entrada
│   ├── public/                   # Archivos estáticos
│   ├── dist/                     # Build compilado
│   ├── package.json
│   ├── vite.config.js
│   ├── .env                      # Variables de entorno (no subir)
│   └── README.md                 # Documentación del frontend
│
├── RANKING_DOCUMENTATION.md      # Documentación del sistema de rankings
├── RANKING_INTEGRATION_COMPLETE.md
├── RANKING_DARK_MODE.md          # Estilos dark mode del ranking
├── RANKING_FINAL_STATUS.md
├── README.md                     # Este archivo
└── .gitignore                    # Archivos a ignorar en Git
```

---

## 📖 Documentación

### Documentos Principales
- **[Backend README](./backend/README.md)** - Documentación completa del API
- **[Frontend README](./fronted/README.md)** - Guía de desarrollo frontend

### Endpoints Principales

**Autenticación**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
```

**Usuarios**
```
GET    /api/users/:id
PUT    /api/users/:id
POST   /api/users/:id/follow
POST   /api/users/:id/block
```

**Proyectos**
```
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/like
POST   /api/projects/:id/comment
```

**Analytics**
```
GET    /api/analytics/dashboard
GET    /api/analytics/project/:id
GET    /api/analytics/top-projects
GET    /api/analytics/activity
```

**Rankings**
```
GET    /api/ranking/global
GET    /api/ranking/projects
GET    /api/ranking/tags
GET    /api/ranking/weekly
GET    /api/ranking/my-position
```

Para más endpoints, ver [Backend README](./backend/README.md)

---

## 🧪 Testing

### Backend

```bash
cd backend

# Ejecutar todos los tests
npm test

# Ejecutar test específico
npm test analytics.test.js

# Con cobertura
npm test -- --coverage

# Modo observador
npm run test:watch
```

**Status**: ✅ 109/113 tests passing (96%)

### Frontend

```bash
cd fronted

# Lint
npm run lint

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## 🔄 Flujo de Trabajo

### Desarrollo

1. **Haz cambios** en tu rama feature
2. **Ejecuta tests** para asegurarte que todo funciona
3. **Compila** el frontend: `npm run build`
4. **Commit** tus cambios
5. **Push** a tu rama
6. **Abre Pull Request**

### Workflow Típico

```bash
# 1. Crear rama
git checkout -b feature/nueva-funcionalidad

# 2. Instalar dependencias (si es necesario)
npm install

# 3. Desarrollo
# Edita archivos...

# 4. Testear
npm test

# 5. Compilar frontend
cd fronted && npm run build

# 6. Commit y push
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nueva-funcionalidad

# 7. Abrir PR en GitHub
```

---

## 🌐 Despliegue

### Opción 1: Vercel + Railway

**Frontend en Vercel**
```bash
cd fronted
vercel
```

**Backend en Railway**
```bash
cd backend
railway login
railway init
railway up
```

### Opción 2: Heroku

```bash
heroku create tfg-portafolios
heroku config:set JWT_SECRET=tu_secret
git push heroku main
```

### Opción 3: Docker

```bash
# Build
docker-compose build

# Run
docker-compose up
```

---

## 🔐 Seguridad

### Implementado
- ✅ Autenticación JWT
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de entrada
- ✅ CORS configurado
- ✅ HTTPS en producción
- ✅ Variables sensibles en .env
- ✅ Rate limiting
- ✅ Headers de seguridad
---

## 📊 Estadísticas del Proyecto

### Codebase
- **Backend**: 1000+ líneas de código
- **Frontend**: 2000+ líneas de código
- **Tests**: 35+ tests automatizados
- **Documentación**: 1000+ líneas

### Build
- **Módulos**: 147 en frontend
- **Bundle Size**: ~150KB gzipped
- **Build Time**: 2.71 segundos
- **Lighthouse Score**: 90+

---

## 🐛 Troubleshooting

### Backend no conecta a MongoDB
```
Error: MongooseServerSelectionError
Solución: Verificar MONGODB_URI en .env
```

### JWT token inválido
```
Error: 401 Unauthorized
Solución: Regenerar JWT_SECRET
```

### CORS error en frontend
```
Error: Access to XMLHttpRequest blocked by CORS
Solución: Verificar VITE_API_URL y CORS en backend
```

### Imágenes no se suben
```
Error: Cloudinary upload failed
Solución: Verificar credenciales de Cloudinary en .env
```

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

```

Copyright (c) 2026 Andrés Molina González

```

---

## 📞 Contacto y Soporte

### Equipo de Desarrollo
- **Desarrollador**: Andrés Rodríguez
- **Email**: andriu@example.com
- **GitHub**: [AndriuuU](https://github.com/AndriuuU)

### Reportar Issues
Si encuentras un bug o tienes sugerencias:
1. Abre un [issue en GitHub](https://github.com/AndriuuU/tfg-portafolios/issues)
2. Describe el problema en detalle
3. Incluye pasos para reproducir
4. Proporciona capturas si es posible

### Preguntas Frecuentes (FAQ)

**P: ¿Cómo cambio el tema oscuro?**
R: En la barra de navegación hay un botón de tema. Los estilos se guardan en localStorage.

**P: ¿Cómo subo una imagen en un proyecto?**
R: Al crear/editar proyecto, hay un selector de imagen que sube directamente a Cloudinary.

**P: ¿Cómo aparezco en el ranking?**
R: Tu cuenta debe ser pública. Configuralo en Privacidad de Perfil.

**P: ¿Cómo recupero mi contraseña?**
R: En login, haz clic en "¿Olvidaste tu contraseña?" y sigue el email.

---

## 🚀 Despliegue en Producción

### Desplegar Backend en Railway

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Crea una cuenta y conecta tu repositorio GitHub

2. **Configurar variables de entorno**
   - En Railway, añade las siguientes variables:
   - `MONGODB_URI`: URI de MongoDB Atlas
   - `JWT_SECRET`: Tu clave secreta
   - `CLOUDINARY_*`: Credenciales de Cloudinary
   - `SENDGRID_API_KEY`: API key de SendGrid
   - `SENDGRID_FROM_EMAIL`: Email para SendGrid

3. **Deploy automático**
   - Railway auto-despliega cuando haces push a la rama principal

### Desplegar Frontend en Netlify

1. **Crear cuenta en Netlify**
   - Ve a [netlify.com](https://netlify.com)
   - Conecta tu repositorio GitHub

2. **Configurar build**
   - Base directory: `fronted`
   - Build command: `npm run build`
   - Publish directory: `fronted/dist`

3. **Variables de entorno**
   - `VITE_API_URL`: URL del backend en Railway
   - `API_URL`: URL del backend (para detectar ambiente)

4. **Deploy automático**
   - Netlify auto-despliega cuando haces push

---

## 🎯 Roadmap

### v1.1 (Próximo)
- [ ] Chat en tiempo real
- [ ] Sistema de badges

### v1.2
- [ ] API pública para desarrolladores
- [ ] Integraciones con GitHub
- [ ] Sistema de recomendaciones
- [ ] Análisis predictivo

### v2.0
- [ ] Machine learning para recomendaciones
- [ ] Marketplace de servicios
- [ ] Comunidades y foros

---

## 🙏 Agradecimientos

Este proyecto ha sido posible gracias a:

- React community
- Express.js team
- MongoDB & Mongoose
- Cloudinary
- Todos los usuarios y testers
- Mentores y profesores

---

## 📈 Progreso del Proyecto

```
✅ Autenticación de usuarios
✅ Gestión de perfiles
✅ Crear y editar proyectos
✅ Sistema de likes y comentarios
✅ Analytics y estadísticas
✅ Sistema de rankings
✅ Notificaciones
✅ Búsqueda avanzada
✅ Búsqueda de usuarios
✅ Modo oscuro y claro
✅ Tests automatizados
✅ Documentación completa
✅ Panel administrador
✅ Sistema de reportes
✅ Exportar portafolio como PDF
✅ Despliegue en Railway (backend)
✅ Despliegue en Netlify (frontend)
✅ SendGrid para emails transaccionales
✅ Gestión de usuarios bloqueados
✅ Historial de actividad
```

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0.0  
**Status**: ✅ Producción
