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

### 🌙 Diseño Responsive
- Mobile-first design
- Modo oscuro y claro
- Totalmente responsive
- Optimizado para todos los dispositivos

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
- **Nodemailer** - Envío de emails
- **Jest** - Testing

### Infraestructura
- **Node.js** - Runtime JavaScript
- **npm** - Gestor de dependencias
- **Git** - Control de versiones
- **Cloudinary** - Almacenamiento de imágenes
- **Mailtrap** - Servicio de email

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16.x o superior)
- **npm** (versión 8.x o superior)
- **MongoDB** (local o MongoDB Atlas)
- **Git**

Cuentas externas requeridas:
- **Cloudinary** (para almacenamiento de imágenes)
- **Mailtrap** o similar (para envío de emails)

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
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/tfg-portafolios
JWT_SECRET=tu_clave_secreta_muy_larga_aqui
CLOUDINARY_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=tu_usuario
EMAIL_PASSWORD=tu_password
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

### Checklist de Seguridad
- [ ] No subir `.env` a Git
- [ ] Regenerar `JWT_SECRET` en producción
- [ ] Usar HTTPS en producción
- [ ] Configurar CORS correctamente
- [ ] Validar todas las entradas
- [ ] Sanitizar datos de usuario
- [ ] Auditar dependencias regularmente

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

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Pautas de Contribución
- Sigue el código existente
- Escribe tests para nuevas funciones
- Actualiza la documentación
- Usa convenciones de commit semantic

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

```
MIT License

Copyright (c) 2024 Andrés Rodríguez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
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

## 🎯 Roadmap

### v1.1 (Próximo)
- [ ] Chat en tiempo real
- [ ] Sistema de badges
- [ ] Exportar portafolio como PDF

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
✅ Modo oscuro
✅ Tests automatizados
✅ Documentación completa
```

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0  
**Status**: ✅ Producción
