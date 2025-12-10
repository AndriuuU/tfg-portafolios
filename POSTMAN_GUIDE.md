# 📮 Guía de Postman - TFG Portafolios

## 📥 Cómo Importar la Colección

### Paso 1: Descargar Postman
Si no tienes Postman instalado, descárgalo desde [postman.com](https://www.postman.com/downloads/)

### Paso 2: Importar la Colección
1. Abre Postman
2. Click en **Import** (arriba a la izquierda)
3. Selecciona **Upload Files**
4. Busca el archivo `Postman_Collection.json`
5. Click **Import**

### Paso 3: Configurar Variables
En Postman, parte superior derecha, click en el ícono de ojos (👁️) para ver las variables:
- `baseUrl`: `https://tfg-portafolios-production.up.railway.app/api`
- `token`: (Lo obtendrás después de hacer login)
- `userId`: (Tu ID de usuario)
- `projectId`: (ID del proyecto a probar)

---

## 🔑 Cómo Obtener el Token (JWT)

### 1. Login
1. En Postman, ve a: **Autenticación → Login**
2. Body debe ser:
```json
{
  "email": "juan@test.com",
  "password": "Test123456!"
}
```
3. Click **Send**
4. Copia el `token` de la respuesta

### 2. Guardar Token en Variables
1. Respuesta → Click en el token
2. Copia el valor
3. Variables (arriba derecha) → Editar `token`
4. Pega el valor
5. Save

O automáticamente:
1. En la pestaña **Tests** del request de Login, añade:
```javascript
if (pm.response.code === 200) {
  pm.environment.set("token", pm.response.json().token);
}
```

---

## 👥 Usuarios de Prueba

### Admin
```
Email: admin@test.com
Password: Admin123456!
```

### Usuario Regular 1
```
Email: juan@test.com
Password: Test123456!
```

### Usuario Regular 2
```
Email: maria@test.com
Password: Test123456!
```

### Usuario Privado
```
Email: carlos@test.com
Password: Test123456!
```

### Usuario Bloqueado
```
Email: blocked@test.com
Password: Test123456!
(NO puede hacer login)
```

---

## 🧪 Casos de Prueba en Postman

### 1. Autenticación

#### Test 1.1: Login Exitoso
```
1. Autenticación → Login
2. Cambiar email a: juan@test.com
3. Send
4. Resultado: ✅ 200 OK, token recibido
```

#### Test 1.2: Login Usuario Bloqueado
```
1. Autenticación → Login
2. Email: blocked@test.com
3. Password: Test123456!
4. Send
5. Resultado: ❌ 401 Unauthorized - "Cuenta bloqueada"
```

#### Test 1.3: Contraseña Incorrecta
```
1. Autenticación → Login
2. Password: WrongPassword
3. Send
4. Resultado: ❌ 401 Unauthorized
```

---

### 2. Usuarios

#### Test 2.1: Obtener Perfil
```
1. Usuarios → Obtener Perfil
2. Token debe estar en Headers (automático)
3. Send
4. Resultado: ✅ 200 OK, datos del usuario
```

#### Test 2.2: Buscar Usuarios
```
1. Usuarios → Buscar Usuarios
2. Cambiar query parámetro "q" a: maria
3. Send
4. Resultado: ✅ 200 OK, lista de usuarios
```

#### Test 2.3: Buscar Usuario Bloqueado
```
1. Usuarios → Buscar Usuarios
2. Cambiar "q" a: blocked
3. Send
4. Resultado: ✅ 200 OK, lista vacía (no aparece)
```

#### Test 2.4: Seguir Usuario
```
1. Usuarios → Seguir Usuario
2. Cambiar {{targetUserId}} por ID real
3. Send
4. Resultado: ✅ 200 OK, relación creada
```

#### Test 2.5: Bloquear Usuario
```
1. Usuarios → Bloquear Usuario
2. Cambiar {{targetUserId}} por ID real
3. Send
4. Resultado: ✅ 200 OK, usuario bloqueado
```

---

### 3. Proyectos

#### Test 3.1: Listar Proyectos
```
1. Proyectos → Listar Proyectos
2. Send
3. Resultado: ✅ 200 OK, lista de proyectos
```

#### Test 3.2: Obtener Proyecto
```
1. Proyectos → Obtener Proyecto
2. Cambiar {{projectId}} por ID real
3. Send
4. Resultado: ✅ 200 OK, datos del proyecto
```

#### Test 3.3: Crear Proyecto
```
1. Proyectos → Crear Proyecto
2. Cambiar Body:
{
  "title": "Mi Proyecto de Prueba",
  "description": "Descripción detallada",
  "images": ["https://via.placeholder.com/500"],
  "tags": ["prueba", "api"],
  "category": "diseño"
}
3. Send
4. Resultado: ✅ 201 Created, proyecto creado
```

#### Test 3.4: Actualizar Proyecto
```
1. Proyectos → Actualizar Proyecto
2. Cambiar {{projectId}} por ID del proyecto creado
3. Body:
{
  "title": "Proyecto Actualizado",
  "description": "Nueva descripción"
}
4. Send
5. Resultado: ✅ 200 OK, proyecto actualizado
```

#### Test 3.5: Like Proyecto
```
1. Proyectos → Like Proyecto
2. Cambiar {{projectId}} por ID real
3. Send
4. Resultado: ✅ 200 OK, like registrado
```

#### Test 3.6: Eliminar Proyecto
```
1. Proyectos → Eliminar Proyecto
2. Send
3. Resultado: ✅ 200 OK, proyecto eliminado
```

---

### 4. Comentarios

#### Test 4.1: Crear Comentario
```
1. Comentarios → Crear Comentario
2. Body:
{
  "text": "Muy buen proyecto!"
}
3. Send
4. Resultado: ✅ 201 Created
```

#### Test 4.2: Obtener Comentarios
```
1. Comentarios → Obtener Comentarios
2. Send
3. Resultado: ✅ 200 OK, lista de comentarios
```

---

### 5. Rankings

#### Test 5.1: Ranking Global
```
1. Rankings → Ranking Global
2. Send
3. Resultado: ✅ 200 OK, usuarios ordenados por puntos
4. Verificar: "blocked" NO aparece
```

#### Test 5.2: Ranking Proyectos
```
1. Rankings → Ranking Proyectos
2. Send
3. Resultado: ✅ 200 OK, proyectos ordenados
```

---

### 6. Analytics

#### Test 6.1: Dashboard
```
1. Analytics → Dashboard Analytics
2. Send
3. Resultado: ✅ 200 OK, métricas personales
```

#### Test 6.2: Analytics por Proyecto
```
1. Analytics → Analytics Proyecto
2. Cambiar {{projectId}} por ID real
3. Send
4. Resultado: ✅ 200 OK, datos del proyecto
```

---

### 7. Admin

#### Test 7.1: Listar Usuarios (Solo Admin)
```
1. Cambiar token: login como admin@test.com
2. Admin → Listar Usuarios
3. Send
4. Resultado: ✅ 200 OK (si es admin)
5. Resultado: ❌ 403 Forbidden (si no es admin)
```

#### Test 7.2: Ver Cuentas Bloqueadas
```
1. Token: admin
2. Admin → Ver Cuentas Bloqueadas
3. Send
4. Resultado: ✅ 200 OK, lista de bloqueados
5. Verificar: "blockeduser" aparece
```

#### Test 7.3: Bloquear Usuario (Admin)
```
1. Token: admin
2. Admin → Bloquear Usuario
3. Cambiar {{userId}} por ID real
4. Body:
{
  "reason": "Violación de términos"
}
5. Send
6. Resultado: ✅ 200 OK, usuario bloqueado
```

#### Test 7.4: Desbloquear Usuario
```
1. Token: admin
2. Admin → Desbloquear Usuario
3. Send
4. Resultado: ✅ 200 OK, usuario desbloqueado
```

#### Test 7.5: Listar Reportes
```
1. Token: admin
2. Admin → Listar Reportes
3. Send
4. Resultado: ✅ 200 OK, reportes pendientes
```

---

### 8. Notificaciones

#### Test 8.1: Obtener Notificaciones
```
1. Notificaciones → Obtener Notificaciones
2. Send
3. Resultado: ✅ 200 OK, lista de notificaciones
```

#### Test 8.2: Marcar como Leída
```
1. Notificaciones → Marcar como Leída
2. Cambiar {{notificationId}} por ID real
3. Send
4. Resultado: ✅ 200 OK
```

---

### 9. Exportación

#### Test 9.1: Exportar PDF
```
1. Exportación → Exportar PDF
2. Send
3. Resultado: ✅ 200 OK, binario de PDF
4. Guardar respuesta como archivo .pdf
```

---

## ✅ Checklist de Pruebas

### Autenticación
- [ ] Login correcto
- [ ] Login usuario bloqueado
- [ ] Contraseña incorrecta
- [ ] Token guardado

### Usuarios
- [ ] Obtener perfil
- [ ] Buscar usuarios
- [ ] Usuario bloqueado no aparece
- [ ] Seguir usuario
- [ ] Bloquear usuario

### Proyectos
- [ ] Listar proyectos
- [ ] Crear proyecto
- [ ] Actualizar proyecto
- [ ] Like proyecto
- [ ] Crear comentario
- [ ] Eliminar proyecto

### Admin
- [ ] Listar usuarios (solo admin)
- [ ] Ver bloqueados
- [ ] Bloquear usuario
- [ ] Desbloquear usuario
- [ ] Acceso denegado (no admin)

### Rankings
- [ ] Ranking global (bloqueados NO aparecen)
- [ ] Ranking proyectos

### Analytics
- [ ] Dashboard personal
- [ ] Analytics por proyecto

### Notificaciones
- [ ] Obtener notificaciones
- [ ] Marcar como leída

### Exportación
- [ ] Exportar PDF

---

## 🔧 Detalles de Headers

Todos los requests protegidos requieren:
```
Authorization: Bearer {token}
Content-Type: application/json
```

El token se obtiene del login y es un JWT válido por 7 días.

---

## 🐛 Errores Comunes

### Error 401 Unauthorized
- **Causa**: Token expirado o no proporcionado
- **Solución**: Vuelve a hacer login y actualiza el token

### Error 403 Forbidden
- **Causa**: No eres admin
- **Solución**: Usa cuenta de admin (admin@test.com)

### Error 404 Not Found
- **Causa**: Usuario/Proyecto no existe o está bloqueado
- **Solución**: Verifica que el ID es correcto

### Error 409 Conflict
- **Causa**: Email duplicado en registro
- **Solución**: Usa otro email

---

## 📊 Respuestas Esperadas

### Login Exitoso (200)
```json
{
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "email": "juan@test.com",
    "username": "juangarcia",
    "isAdmin": false
  }
}
```

### Crear Proyecto (201)
```json
{
  "_id": "...",
  "title": "Mi Proyecto",
  "description": "...",
  "userId": "...",
  "createdAt": "2025-12-10T10:30:00Z",
  "updatedAt": "2025-12-10T10:30:00Z"
}
```

### Ranking Global (200)
```json
[
  {
    "rank": 1,
    "userId": "...",
    "username": "marialopez",
    "points": 450,
    "projectsCount": 4
  },
  {
    "rank": 2,
    "userId": "...",
    "username": "juangarcia",
    "points": 380,
    "projectsCount": 3
  }
]
```

---

**Versión**: 1.0.0
**Última actualización**: Diciembre 10, 2025
