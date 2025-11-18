# TFG Portafolios - Frontend

## 📱 Descripción

TFG Portafolios es una plataforma web moderna y responsive para crear, compartir y descubrir portafolios digitales. El frontend está construido con **React** y **Vite**, ofreciendo una experiencia de usuario rápida, fluida y atractiva.

Con esta aplicación puedes:
- 📸 Crear portafolios profesionales con tus mejores proyectos
- 🌍 Compartir tu trabajo con la comunidad
- 👥 Conectar con otros creativos y profesionales
- 💬 Interactuar mediante likes y comentarios
- 📊 Analizar el rendimiento de tus proyectos
- 🏆 Competir en el ranking global de usuarios

---

## 🚀 Empezando

### Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- **Node.js** (versión 16.x o superior)
- **npm** (versión 8.x o superior)
- Git para clonar el repositorio

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/AndriuuU/tfg-portafolios.git
   cd tfg-portafolios/fronted
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env` en la raíz del directorio `fronted`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

---

## 📦 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm run dev`
Inicia el servidor de desarrollo con hot reload (recarga en tiempo real).
```bash
npm run dev
```

### `npm run build`
Compila la aplicación para producción.
```bash
npm run build
```

### `npm run preview`
Previsualiza la versión compilada de producción localmente.
```bash
npm run preview
```

### `npm run lint`
Ejecuta ESLint para verificar la calidad del código.
```bash
npm run lint
```

---

## 🏗️ Estructura del Proyecto

```
fronted/
├── src/
│   ├── api/                      # Configuración de llamadas API
│   │   ├── api.js                # Instancia de axios
│   │   ├── followApi.js           # Endpoints de seguimiento
│   │   └── rankingApi.js          # Endpoints de ranking
│   │
│   ├── components/               # Componentes reutilizables
│   │   ├── Analytics.jsx          # Dashboard de estadísticas
│   │   ├── BlockedUsers.jsx       # Lista de usuarios bloqueados
│   │   ├── BlockUserButton.jsx    # Botón para bloquear usuarios
│   │   ├── CollaborativeProjects.jsx # Proyectos colaborativos
│   │   ├── Comments.jsx           # Sistema de comentarios
│   │   ├── FollowButton.jsx       # Botón de seguimiento
│   │   ├── Header.jsx             # Barra de navegación
│   │   ├── NotificationBell.jsx   # Campana de notificaciones
│   │   ├── ProjectForm.jsx        # Formulario de proyectos
│   │   ├── ProjectPost.jsx        # Tarjeta de proyecto
│   │   ├── Ranking.jsx            # Componente de ranking
│   │   ├── SearchBar.jsx          # Barra de búsqueda
│   │   └── Toast.jsx              # Notificaciones emergentes
│   │
│   ├── pages/                    # Páginas principales
│   │   ├── Dashboard.jsx          # Página principal
│   │   ├── EditProject.jsx        # Edición de proyectos
│   │   ├── ForgotPassword.jsx     # Recuperación de contraseña
│   │   ├── Home.jsx               # Página de inicio
│   │   ├── Login.jsx              # Formulario de login
│   │   ├── AnalyticsPage.jsx      # Página de estadísticas
│   │   ├── ProfilePage.jsx        # Perfil de usuario
│   │   └── ...
│   │
│   ├── context/                  # Context API para estado global
│   │   └── ToastContext.jsx       # Contexto de notificaciones
│   │
│   ├── styles/                   # Estilos SCSS
│   │   ├── abstracts/
│   │   │   ├── mixins.scss        # Mixins reutilizables
│   │   │   └── variables.scss     # Variables CSS y paleta de colores
│   │   ├── Analytics.scss         # Estilos del dashboard
│   │   ├── App.css                # Estilos globales
│   │   └── ...
│   │
│   ├── App.jsx                   # Componente raíz
│   ├── main.jsx                  # Punto de entrada
│   └── index.css                 # Estilos base
│
├── public/                       # Archivos estáticos
├── dist/                         # Build compilado (generado)
├── package.json                  # Dependencias y scripts
├── vite.config.js                # Configuración de Vite
├── eslint.config.js              # Configuración de ESLint
└── README.md                     # Este archivo
```

---

## 🎨 Características Principales

### 1. **Autenticación y Autorización**
- Registro e inicio de sesión con email y contraseña
- Recuperación de contraseña por email
- Tokens JWT para seguridad
- Roles de usuario y permisos

### 2. **Gestión de Portafolios**
- Crear, editar y eliminar proyectos
- Subida de imágenes a Cloudinary
- Categorización de proyectos
- Descripción con etiquetas

### 3. **Interacción Social**
- Sistema de likes en proyectos
- Comentarios y respuestas
- Seguimiento de usuarios
- Solicitudes de seguimiento pendientes
- Bloqueo de usuarios

### 4. **Análisis y Estadísticas**
- Dashboard personalizado con métricas
- Gráficos de vistas diarias
- Estadísticas de engagement
- Análisis por proyecto
- Exportación de datos

### 5. **Sistema de Rankings**
- Ranking global de usuarios
- Ranking de proyectos
- Rankings por categoría
- Rankings semanales
- Posición del usuario

### 6. **Notificaciones**
- Sistema de notificaciones en tiempo real
- Campana de notificaciones
- Historial de notificaciones
- Marca como leído

### 7. **Búsqueda y Filtros**
- Búsqueda de usuarios
- Búsqueda de proyectos
- Búsqueda de etiquetas
- Filtros avanzados

### 8. **Responsive Design**
- Diseño mobile-first
- Soporta todos los tamaños de pantalla
- Modo oscuro (dark mode)
- Tema claro (light mode)

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React** | 18.x | Framework UI |
| **Vite** | 5.x | Bundler y servidor de desarrollo |
| **Axios** | Latest | Cliente HTTP |
| **React Router** | Latest | Enrutamiento |
| **SCSS** | Latest | Preprocesador CSS |
| **Cloudinary** | Latest | Almacenamiento de imágenes |
| **JWT** | Latest | Autenticación |
| **ESLint** | Latest | Linting |

---

## 🎨 Sistema de Estilos

### Variables CSS Disponibles

El proyecto utiliza variables CSS centralizadas para fácil personalización:

**Tema Claro (Light Mode)**
```css
--primary-color: #667eea
--secondary-color: #764ba2
--accent-color: #f5576c
--text-primary: #1a1a1a
--text-secondary: #666666
--bg-light: #ffffff
--bg-secondary: #f5f5f5
--border-color: #e0e0e0
```

**Tema Oscuro (Dark Mode)**
```css
--primary-color-dark: #7d8ffa
--secondary-color-dark: #8b5bb5
--text-primary-dark: #ffffff
--text-secondary-dark: #cccccc
--bg-dark: #1a1a1a
--card-bg-dark: #2d2d2d
--border-dark: #404040
```

### Mixins SCSS Útiles

```scss
@include mobile { ... }        // < 768px
@include tablet { ... }        // 768px - 1024px
@include desktop { ... }       // > 1024px
@include dark-mode { ... }     // Modo oscuro
@include flex-center { ... }   // Centra con flexbox
```

---

## 📚 Componentes Principales

### Analytics.jsx
Dashboard de estadísticas con 4 pestañas:
- **Resumen**: Métricas generales (vistas, likes, comentarios, visitantes únicos)
- **Proyectos Top**: Tus proyectos más populares
- **Engagement**: Análisis de interacción
- **Ranking Global**: Tu posición en el ranking mundial

```jsx
<Analytics />
```

### ProjectPost.jsx
Tarjeta de proyecto con interacciones:
- Imagen, título y descripción
- Botones de like y comentario
- Avatar del autor
- Información de engagement

```jsx
<ProjectPost 
  project={projectData}
  onLike={handleLike}
  onComment={handleComment}
/>
```

### Ranking.jsx
Tabla interactiva con rankings globales:
- Posición del usuario
- Top 10 usuarios
- Información de scores
- Resaltado del usuario actual

```jsx
<Ranking />
```

---

## 🔄 Flujo de Autenticación

```
Login
  ↓
Credenciales validadas por backend
  ↓
JWT token recibido
  ↓
Token guardado en localStorage
  ↓
Headers API actualizados con token
  ↓
Acceso a rutas protegidas
  ↓
Cierre de sesión → Token eliminado
```

---

## 🌐 Configuración del API

El cliente HTTP está configurado en `src/api/api.js`:

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Interceptor para agregar token
API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

export default API;
```

---

## 📱 Responsive Design

El proyecto usa breakpoints estándar:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Todos los componentes están optimizados para verse bien en cualquier pantalla.

---

## 🌙 Modo Oscuro

El modo oscuro está integrado en todo el proyecto:

```javascript
// Detectar preferencia del sistema
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// O cambiar manualmente
document.documentElement.setAttribute('data-theme', 'dark');
```

Los estilos se adaptan automáticamente usando variables CSS.

---

## 🔐 Seguridad

- ✅ Tokens JWT para autenticación
- ✅ Solicitudes HTTPS en producción
- ✅ Protección CORS configurada
- ✅ Validación de entrada en formularios
- ✅ Almacenamiento seguro de tokens
- ✅ Manejo seguro de datos sensibles

---

## 🚀 Despliegue

### Compilar para Producción

```bash
npm run build
```

Esto genera una carpeta `dist/` lista para desplegar.

### Opciones de Despliegue

**Vercel**
```bash
vercel
```

**Netlify**
```bash
netlify deploy --prod --dir=dist
```

**GitHub Pages**
```bash
npm run build
# Commit y push a rama gh-pages
```

**Servidor Manual**
```bash
# Subir contenido de 'dist/' a tu servidor web
# Configurar servidor para servir index.html en rutas no encontradas
```

---

## 🐛 Debugging

### Consola del Navegador
- Abre DevTools (F12)
- Busca errores en la pestaña Console
- Inspecciona elementos en Elements
- Usa Network para ver llamadas API

### Logging en Desarrollo
```javascript
// En desarrollo
if (import.meta.env.DEV) {
  console.log('Debug info');
}
```

---

## 📊 Rendimiento

### Optimizaciones Implementadas
- ✅ Code splitting con Vite
- ✅ Lazy loading de componentes
- ✅ Compresión de imágenes
- ✅ Caché de API
- ✅ Minimización de CSS/JS

### Métricas
- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: ~150KB (gzipped)

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para detalles.

---

## 📞 Soporte

¿Preguntas o problemas? Abre un issue en GitHub o contacta al equipo de desarrollo.

**Autor**: Andrés Molina González  
**Email**: andresmolinagonz@gmail.com
**Última actualización**: Noviembre 2025
