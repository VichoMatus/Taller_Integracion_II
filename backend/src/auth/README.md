# 🔐 Auth Module - Endpoints

## 📋 **Endpoints Disponibles**

### 🔐 **Autenticación**

#### `POST /api/auth/register`
Registrar nuevo usuario.

#### `POST /api/auth/login`
Iniciar sesión con email y contraseña.

#### `POST /api/auth/logout`
Cerrar sesión del usuario.

#### `POST /api/auth/refresh`
Renovar access token usando refresh token.

### 👤 **Perfil de Usuario**

#### `GET /api/auth/me`
Obtener perfil del usuario autenticado.

#### `PATCH /api/auth/me`
Actualizar perfil del usuario.

#### `PATCH /api/auth/me/password`
Cambiar contraseña del usuario.

### 📧 **Verificación de Email**

#### `POST /api/auth/verify-email`
Verificar email con token de verificación.

#### `POST /api/auth/resend-verification`
Reenviar email de verificación.

### 🔑 **Recuperación de Contraseña**

#### `POST /api/auth/forgot-password`
Solicitar restablecimiento de contraseña.

#### `POST /api/auth/reset-password`
Restablecer contraseña con token.

### 📱 **Push Notifications**

#### `POST /api/auth/me/push-token`
Registrar/actualizar token FCM para notificaciones push.

### 🛠️ **Utilidades**

#### `GET /api/auth/status`
Verificar estado del servicio de autenticación.