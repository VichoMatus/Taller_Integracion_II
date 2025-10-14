# TESTING DE USUARIOS ADMIN

## Usuarios Admin Verificados ✅

### `dueno.cancha@gmail.com`
- **Contraseña:** `12345678`
- **Rol:** `admin`
- **Estado:** ✅ Funcionando correctamente
- **Acceso:** Panel de admin (/admin)

## Cómo probar un nuevo usuario admin

### Opción 1: Usando curl/PowerShell
```powershell
# Probar login
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "NUEVO_EMAIL", "password": "CONTRASEÑA"}'

# Si el login es exitoso, probar el endpoint /auth/me
$token = "TOKEN_OBTENIDO"
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/me" -Headers @{"Authorization"="Bearer $token"}
```

### Opción 2: Usando el navegador
1. Ir a http://localhost:3000/login
2. Ingresar credenciales del usuario
3. Si es admin, debería redirigir automáticamente a /admin
4. Si hay problemas, revisar logs de consola para debugging

### Verificar rol en respuesta
La respuesta de `/auth/me` debe contener:
```json
{
  "ok": true,
  "data": {
    "id_usuario": 34,
    "nombre": "dueno",
    "apellido": "test", 
    "email": "dueno.cancha@gmail.com",
    "telefono": null,
    "avatar_url": null,
    "rol": "admin"  // ← Debe ser "admin" o "super_admin"
  }
}
```

## Roles válidos para acceso admin
- `admin` → Acceso al panel de admin (/admin)
- `super_admin` → Redirige automáticamente al panel de superadmin (/superadmin)

## Troubleshooting

### Si un usuario no puede acceder:
1. Verificar que el usuario exista en la base de datos
2. Confirmar que el rol sea exactamente "admin" o "super_admin" 
3. Probar login con curl para verificar credenciales
4. Revisar logs de consola del navegador para mensajes del hook
5. Verificar que el backend esté corriendo en puerto 4000

### Logs útiles:
Los logs del hook aparecen con prefijo `[useAdminProtection]` en la consola del navegador:
- ✅ Acceso autorizado
- ❌ Acceso denegado (con detalles del motivo)
- 🔄 Redirección a superadmin
- 🔍 Información de debugging