# 🔧 Solución: Error "Owner ID no encontrado en el token"

## 📋 **Diagnóstico del Problema**

Después del merge entre las ramas `admin` y `usuario`, el backend está lanzando el error:
```
"Owner ID no encontrado en el token"
```

### **Causa Raíz**:
El problema ocurre porque:

1. **El backend tiene un middleware o guard** que extrae el `owner_id` del token JWT
2. **Este middleware se está aplicando a TODOS los endpoints**, incluyendo los que usan usuarios normales
3. **Los usuarios normales NO tienen `owner_id`** en su token, solo los admins/owners
4. **El código está fallando** cuando intenta acceder a un campo que no existe

### **Archivos Involucrados**:
- Backend: `backend/src/config/backend.ts` (líneas 234, 281, 296)
- El error se genera en el interceptor de respuestas de Axios
- El error original viene del BFF (Backend For Frontend)

---

## ✅ **Soluciones Propuestas**

### **Solución 1: Modificar el Middleware del Backend (RECOMENDADA)**

El backend debe verificar si el endpoint REQUIERE el `owner_id` antes de lanzar un error.

**Archivo**: `backend/src/interfaces/auth.ts` o donde esté el middleware de autenticación

**Cambio necesario**:
```typescript
// ❌ ANTES (incorrecto):
export function getOwnerIdFromToken(req: Request): number {
  const token = getBearerFromReq(req);
  const decoded = jwt.verify(token, JWT_SECRET);
  
  if (!decoded.owner_id) {
    throw new Error('Owner ID no encontrado en el token');
  }
  
  return decoded.owner_id;
}

// ✅ DESPUÉS (correcto):
export function getOwnerIdFromToken(req: Request): number | null {
  const token = getBearerFromReq(req);
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // Retornar null si no existe, no lanzar error
  return decoded.owner_id || null;
}

// Y crear una función que SÍ lance error para endpoints que lo requieran:
export function requireOwnerIdFromToken(req: Request): number {
  const ownerId = getOwnerIdFromToken(req);
  
  if (!ownerId) {
    throw new Error('Owner ID no encontrado en el token');
  }
  
  return ownerId;
}
```

**Uso en rutas**:
```typescript
// Para endpoints de usuarios normales (no requieren owner_id):
router.get('/disponibilidad', (req, res) => {
  // No llamar a getOwnerIdFromToken aquí
  const userId = getUserIdFromToken(req); // Solo usar user_id
  // ...
});

// Para endpoints de admin/owner (SÍ requieren owner_id):
router.get('/admin/panel', authMiddleware, requireRole('admin', 'owner'), (req, res) => {
  const ownerId = requireOwnerIdFromToken(req); // Aquí sí lanzar error si falta
  // ...
});
```

---

### **Solución 2: Aplicar Middleware Condicional**

Crear un middleware que solo se aplique a rutas de admin/owner:

**Archivo**: `backend/src/admin/middlewares/ownerMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { getOwnerIdFromToken } from '../interfaces/auth';

export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = getOwnerIdFromToken(req);
    
    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: Se requiere ser propietario de un complejo'
      });
    }
    
    // Adjuntar owner_id al request para uso posterior
    (req as any).ownerId = ownerId;
    next();
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      message: 'Error de autenticación: ' + error.message
    });
  }
};
```

**Uso en rutas**:
```typescript
// Rutas de admin/owner - aplicar middleware
router.get('/admin/panel', authMiddleware, requireOwner, (req, res) => {
  const ownerId = (req as any).ownerId;
  // ...
});

// Rutas de usuario - NO aplicar middleware
router.get('/disponibilidad', (req, res) => {
  // No requiere owner_id
  // ...
});
```

---

### **Solución 3: Verificar Roles Antes de Extraer owner_id**

Agregar una verificación de rol antes de intentar extraer el `owner_id`:

```typescript
export function getOwnerIdFromToken(req: Request): number | null {
  const token = getBearerFromReq(req);
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  
  // Solo intentar obtener owner_id si el rol es admin u owner
  if (decoded.role === 'admin' || decoded.role === 'owner' || decoded.role === 'super_admin') {
    return decoded.owner_id || null;
  }
  
  // Para usuarios normales, retornar null sin error
  return null;
}
```

---

## 🔍 **Verificación del Token**

Para debuggear, agregar logs en el backend:

```typescript
console.log('🔍 Token decoded:', {
  user_id: decoded.user_id,
  role: decoded.role,
  owner_id: decoded.owner_id, // Puede ser undefined para usuarios normales
  email: decoded.email
});
```

**Estructura esperada del token**:

**Usuario normal**:
```json
{
  "user_id": 123,
  "email": "usuario@example.com",
  "role": "usuario",
  "iat": 1700000000,
  "exp": 1700086400
}
```

**Admin/Owner**:
```json
{
  "user_id": 456,
  "email": "admin@example.com",
  "role": "admin",
  "owner_id": 789,  // ⬅️ Este campo solo existe para admins/owners
  "iat": 1700000000,
  "exp": 1700086400
}
```

---

## 📝 **Pasos para Implementar la Solución**

### **Backend**:

1. **Ubicar el archivo donde se extrae owner_id**:
   ```bash
   cd backend
   grep -r "Owner ID no encontrado" src/
   ```

2. **Modificar la función** según la Solución 1 o 3

3. **Aplicar middleware condicional** según la Solución 2

4. **Reiniciar el backend**:
   ```bash
   sudo docker compose down
   sudo docker compose up -d backend
   ```

### **Frontend** (opcional - para mejor manejo de errores):

1. **Actualizar el interceptor** en `sporthub-temuco/src/config/backend.ts`:

```typescript
// En el interceptor de errores, filtrar errores de owner_id
if (error.response?.data) {
  const errorData = error.response.data;
  let errorMessage = 'Error del servidor';
  
  // Ignorar errores de owner_id para usuarios normales
  if (typeof errorData.message === 'string' && 
      errorData.message.includes('Owner ID') &&
      error.config?.url && 
      !error.config.url.includes('/admin/')) {
    console.warn('⚠️ Error de owner_id ignorado para endpoint público:', error.config.url);
    return Promise.resolve(error.response); // No propagar el error
  }
  
  // ... resto del código
}
```

---

## ✅ **Verificación de la Solución**

Después de implementar los cambios:

1. **Limpiar caché y tokens**:
   ```javascript
   localStorage.clear();
   ```

2. **Iniciar sesión como usuario normal**

3. **Navegar a una página pública** (ej: `/sports/reservacancha`)

4. **Verificar en la consola** que NO aparezcan errores de "Owner ID"

5. **Iniciar sesión como admin/owner**

6. **Verificar que el panel de admin** funcione correctamente

---

## 🎯 **Resultado Esperado**

- ✅ **Usuarios normales**: Pueden usar la app sin errores de owner_id
- ✅ **Admins/Owners**: Pueden acceder al panel de administración
- ✅ **Endpoints públicos**: Funcionan sin requerir owner_id
- ✅ **Endpoints de admin**: Requieren y validan owner_id correctamente

---

## 📚 **Referencias**

- JWT: https://jwt.io/
- Express Middleware: https://expressjs.com/en/guide/using-middleware.html
- TypeScript Type Guards: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

---

**Autor**: GitHub Copilot  
**Fecha**: 16 de Noviembre de 2025  
**Estado**: ✅ Documentado - Pendiente de implementación en backend
