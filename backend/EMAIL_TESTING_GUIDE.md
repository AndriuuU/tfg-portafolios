# Guía de Pruebas de Email en Postman

## 📋 Importar la Colección

1. Abre Postman
2. Clic en **Import**
3. Selecciona el archivo `Postman_Collection.json`
4. La carpeta **"Email"** aparecerá con 5 requests

---

## 🧪 Pruebas Paso a Paso

### 1️⃣ **Registrar Usuario y Enviar Email de Verificación**

**Endpoint:** `POST /api/auth/register`  
**Carpeta:** Authentication → Register User 1

```json
{
  "username": "testuser123",
  "email": "tu_email_real@gmail.com",
  "name": "Usuario Test",
  "password": "Test123456!"
}
```

**Resultado esperado:**
- ✅ Status 201 Created
- ✅ Recibes un email en tu bandeja
- ✅ Copia el token del email (aparece en la URL de verificación)

---

### 2️⃣ **Verificar Email con Token**

**Endpoint:** `GET /api/email/verify/:token`  
**Carpeta:** Email → Verify Email

1. Reemplaza `:token` en la URL con el token recibido por email
2. URL completa: `http://localhost:5000/api/email/verify/abc123def456...`

**Resultado esperado:**
```json
{
  "message": "Email verificado exitosamente"
}
```

---

### 3️⃣ **Reenviar Email de Verificación**

**Endpoint:** `POST /api/email/resend-verification`  
**Carpeta:** Email → Resend Verification Email

```json
{
  "email": "tu_email_real@gmail.com"
}
```

**Casos de uso:**
- El email inicial no llegó
- El token expiró (más de 24 horas)
- Usuario no verificó a tiempo

**Resultado esperado:**
```json
{
  "message": "Email de verificación reenviado"
}
```

---

### 4️⃣ **Solicitar Recuperación de Contraseña**

**Endpoint:** `POST /api/email/forgot-password`  
**Carpeta:** Email → Forgot Password

```json
{
  "email": "tu_email_real@gmail.com"
}
```

**Resultado esperado:**
- ✅ Status 200 OK
- ✅ Mensaje: "Si el email existe, recibirás instrucciones..."
- ✅ Recibes email con enlace de recuperación
- ✅ Copia el token del email (último segmento de la URL)

**Nota de seguridad:** Siempre devuelve el mismo mensaje, exista o no el email, por seguridad.

---

### 5️⃣ **Restablecer Contraseña con Token**

**Endpoint:** `POST /api/email/reset-password/:token`  
**Carpeta:** Email → Reset Password

1. Reemplaza `:token` con el token recibido en el email de recuperación
2. URL: `http://localhost:5000/api/email/reset-password/abc123def456...`

```json
{
  "newPassword": "NuevaPassword123!"
}
```

**Resultado esperado:**
```json
{
  "message": "Contraseña restablecida exitosamente"
}
```

**Validaciones:**
- ❌ Token inválido o expirado (1 hora) → Error 400
- ❌ Password < 6 caracteres → Error 400

---

### 6️⃣ **Obtener Estado de Verificación**

**Endpoint:** `GET /api/email/status`  
**Carpeta:** Email → Get Email Status

**Requiere:** Token de autenticación (Bearer Token)

**Resultado esperado:**
```json
{
  "email": "tu_email_real@gmail.com",
  "isVerified": true
}
```

---

## 🔑 Variables de Postman

La colección usa estas variables automáticas:

| Variable | Descripción | Se llena automáticamente |
|----------|-------------|--------------------------|
| `{{baseUrl}}` | `http://localhost:5000` | ✅ |
| `{{authToken}}` | JWT del usuario | ✅ Al hacer Register/Login |
| `{{userId}}` | ID del usuario | ✅ Al hacer Register/Login |
| `{{projectId}}` | ID de proyecto | ✅ Al crear proyecto |

---

## 📧 Configuración del Email de Prueba

Para recibir los emails reales, asegúrate de que el archivo `.env` tenga:

```env
EMAIL_USER=portafoliohubtfg@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
EMAIL_FROM=portafoliohubtfg@gmail.com
```

**Importante:** Usa tu propio email real en los tests para ver los correos llegar.

---

## ✅ Checklist de Pruebas Completas

- [ ] 1. Register user → Email llega con token de verificación
- [ ] 2. Verify email con token → Email marcado como verificado
- [ ] 3. Resend verification → Nuevo email llega con nuevo token
- [ ] 4. Forgot password → Email llega con token de reset (1h)
- [ ] 5. Reset password con token → Password cambiada + email confirmación
- [ ] 6. Get email status → Muestra isVerified: true
- [ ] 7. Login con nueva password → Funciona correctamente

---

## 🐛 Troubleshooting

### Email no llega
```bash
# Verificar que el servidor está enviando emails
cd backend
node test-email.js
```

### Token inválido
- Verifica que no tiene espacios al copiar
- Tokens de verificación expiran en 24 horas
- Tokens de reset expiran en 1 hora

### Error 401 en Get Email Status
- Necesitas estar autenticado
- Primero haz Login o Register
- El token se guarda automáticamente en `{{authToken}}`

---

## 🎯 Flujo de Prueba Recomendado

1. **Register** → Guarda el token de verificación del email
2. **Verify Email** → Confirma la cuenta
3. **Get Email Status** → Verifica que isVerified = true
4. **Forgot Password** → Solicita reset
5. **Reset Password** → Cambia la contraseña
6. **Login** → Prueba con la nueva password

---

## 📊 Respuestas HTTP Esperadas

| Endpoint | Éxito | Error Común |
|----------|-------|-------------|
| Verify Email | 200 OK | 400 Token inválido |
| Resend Verification | 200 OK | 404 Usuario no encontrado |
| Forgot Password | 200 OK | Siempre 200 (seguridad) |
| Reset Password | 200 OK | 400 Token expirado |
| Get Email Status | 200 OK | 401 No autenticado |

---

## 🔗 URLs Completas de Ejemplo

```
# Verificar email
GET http://localhost:5000/api/email/verify/a1b2c3d4e5f6g7h8i9j0

# Reenviar verificación
POST http://localhost:5000/api/email/resend-verification

# Olvidé mi contraseña
POST http://localhost:5000/api/email/forgot-password

# Restablecer contraseña
POST http://localhost:5000/api/email/reset-password/x9y8z7w6v5u4t3s2r1q0

# Estado del email (requiere auth)
GET http://localhost:5000/api/email/status
```

---

## 💡 Tips

- Los tokens son strings largos (64 caracteres hex)
- Copia los tokens completos desde los emails
- Usa un email real para pruebas completas
- Los emails pueden tardar 5-10 segundos en llegar
- Revisa la carpeta de spam si no ves el email
