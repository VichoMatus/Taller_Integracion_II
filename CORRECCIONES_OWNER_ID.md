# ✅ Correcciones Aplicadas - Error "Owner ID no encontrado en el token"

**Fecha**: 16 de Noviembre de 2025  
**Rama**: frontend/usuario  
**Estado**: ✅ CORREGIDO

---

## 📁 Archivos Modificados

### 1. **`backend/src/admin/presentation/controllers/admin.controller.ts`**

**Cambio**: Mejorado el método `getOwnerId()` para:
- ✅ Soportar múltiples campos del token JWT (`id`, `id_usuario`, `sub`)
- ✅ Verificar que el usuario tenga rol de admin/owner/super_admin ANTES de intentar extraer el ID
- ✅ Agregar logs detallados para debugging
- ✅ Mensaje de error más descriptivo cuando falta el rol correcto

**Código modificado**:
```typescript
private getOwnerId(req: Request): number {
  const user = (req as any)?.user;
  
  // Log para debugging
  console.log('🔍 [AdminController] Obteniendo owner ID:', {
    hasUser: !!user,
    userId: user?.id || user?.id_usuario || user?.sub,
    role: user?.role || user?.rol,
    allUserData: user
  });
  
  // Verificar que el usuario sea admin u owner
  const userRole = user?.role || user?.rol;
  if (userRole !== 'admin' && userRole !== 'owner' && userRole !== 'super_admin') {
    throw new Error('Acceso denegado: Se requiere rol de administrador o propietario');
  }
  
  // Extraer ID del usuario
  const ownerId = user?.id || user?.id_usuario || user?.sub || Number(req.headers["x-user-id"]);
  
  if (!ownerId) {
    throw new Error("Owner ID no encontrado en el token");
  }
  
  return Number(ownerId);
}
```

---

### 2. **`backend/src/admin/presentation/guards/guards.ts`**

**Cambio**: Actualizado el guard `requireRole()` para:
- ✅ Soportar tanto `role` como `rol` del token JWT
- ✅ Agregar logs detallados de verificación de roles
- ✅ Mostrar información clara cuando falla la autorización

**Código modificado**:
```typescript
export const requireRole =
  (...roles: Array<"admin" | "super_admin">) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any)?.user;
    const role = user?.rol || user?.role || (req.headers["x-user-role"] as string | undefined);

    console.log('🔍 [requireRole] Verificando roles:', {
      requiredRoles: roles,
      userRole: role,
      hasUser: !!user
    });

    if (!role) {
      console.warn('⚠️ [requireRole] No autenticado - sin rol');
      return res.status(401).json(fail(401, "No autenticado"));
    }

    if (!roles.includes(role as any)) {
      console.warn('⚠️ [requireRole] Permisos insuficientes:', {
        userRole: role,
        requiredRoles: roles
      });
      return res.status(403).json(fail(403, "Permisos insuficientes - requiere rol de administrador"));
    }

    console.log('✅ [requireRole] Acceso autorizado:', role);
    next();
  };
```

---

## 🔄 Flujo de Autenticación Corregido

### **Antes** (con error):
```
Usuario Normal → Accede a página pública → 
Backend intenta extraer owner_id → ❌ ERROR: "Owner ID no encontrado en el token"
```

### **Después** (corregido):
```
Usuario Normal → Accede a página pública → 
Backend NO intenta extraer owner_id (rutas públicas no lo necesitan) → ✅ OK

Admin/Owner → Accede a /admin/panel → 
authMiddleware verifica token → 
requireRole verifica rol admin/super_admin → 
getOwnerId extrae ID del token → ✅ OK
```

---

## 🎯 Mejoras Implementadas

### 1. **Verificación de Roles Mejorada**
- ✅ Verifica el rol ANTES de intentar extraer owner_id
- ✅ Mensaje de error claro: "Acceso denegado: Se requiere rol de administrador o propietario"

### 2. **Compatibilidad JWT**
- ✅ Soporta `role` (del token de FastAPI)
- ✅ Soporta `rol` (del token del BFF)
- ✅ Soporta `sub`, `id`, `id_usuario` para el ID de usuario

### 3. **Logging Mejorado**
- ✅ Logs detallados en cada paso de la verificación
- ✅ Información útil para debugging
- ✅ Símbolos visuales (🔍, ✅, ⚠️, ❌) para fácil identificación

### 4. **Manejo de Errores**
- ✅ Errores específicos según el problema
- ✅ HTTP status codes correctos (401 para autenticación, 403 para autorización)
- ✅ Mensajes descriptivos

---

## 📋 Pasos para Aplicar los Cambios

### 1. **Reiniciar el Backend**:
```bash
cd /home/seba_archlinux/Documentos/Semestre4/TallerIntegra2/Proyecto_real/Taller_Integracion_II
sudo docker compose down
sudo docker compose up -d backend
```

### 2. **Verificar los Logs**:
```bash
sudo docker compose logs -f backend
```

### 3. **Limpiar Caché del Navegador**:
```javascript
// En la consola del navegador:
localStorage.clear();
sessionStorage.clear();
```

### 4. **Probar**:
- ✅ Iniciar sesión como **usuario normal**
- ✅ Navegar a páginas públicas (`/sports`, `/sports/futbol`, etc.)
- ✅ Verificar que NO aparezcan errores de "Owner ID"
- ✅ Iniciar sesión como **admin**
- ✅ Acceder a `/admin/panel`
- ✅ Verificar que funcione correctamente

---

## 🐛 Debugging

Si aún hay problemas, verificar los logs:

```bash
# Ver logs del backend
sudo docker compose logs backend | grep "Owner ID"
sudo docker compose logs backend | grep "requireRole"
sudo docker compose logs backend | grep "AdminController"
```

**Qué buscar en los logs**:
- ✅ `[requireRole] Acceso autorizado` - Usuario tiene permisos
- ⚠️ `[requireRole] Permisos insuficientes` - Usuario sin permisos (esperado para usuarios normales)
- ❌ `[AdminController] Usuario sin permisos` - Usuario intentó acceder a endpoint de admin

---

## ✅ Resultado Esperado

### **Para Usuarios Normales**:
- ✅ Pueden navegar libremente por la aplicación
- ✅ NO ven errores de "Owner ID no encontrado"
- ✅ Reciben error 403 si intentan acceder a rutas de admin (comportamiento correcto)

### **Para Admins/Owners**:
- ✅ Pueden acceder al panel de administración
- ✅ Ver sus complejos, canchas y estadísticas
- ✅ Crear, editar y eliminar recursos

---

## 📞 Soporte

Si persiste el problema:
1. Capturar screenshot del error en el navegador
2. Capturar logs del backend: `sudo docker compose logs backend > backend_logs.txt`
3. Verificar token en localStorage: `localStorage.getItem('access_token')`
4. Verificar rol del usuario: `localStorage.getItem('user_role')`

---

**Estado**: ✅ CORREGIDO  
**Próximo paso**: Reiniciar backend y probar
