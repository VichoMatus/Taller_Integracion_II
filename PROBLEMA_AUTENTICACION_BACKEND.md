# 🚨 Problema de Autenticación Backend - Módulo Canchas

> **⚠️ IMPORTANTE**: Este documento describe un problema REAL del backend que **debe ser corregido por el equipo de backend**. No hay soluciones alternativas válidas desde el frontend.

## Descripción del Problema

El frontend está intentando crear/editar/eliminar canchas pero recibe **401 Unauthorized** del backend, a pesar de:
- ✅ Token JWT válido presente en localStorage
- ✅ Token enviado correctamente en header Authorization
- ✅ Usuario `dueno.cancha@gmail.com` con rol "dueno" en el JWT
- ✅ Token no expirado (exp: 1760595381 = año 2025)

## Causa Raíz

El **backend FastAPI** está rechazando las peticiones porque:
1. El endpoint `/api/admin/canchas` requiere validación JWT en el backend
2. El BFF Node.js NO está aplicando el middleware `authMiddleware` antes de `requireRole`
3. Por lo tanto, `req.user` nunca se popula, y `requireRole` siempre encuentra `role = undefined`
4. **NO PODEMOS MODIFICAR EL BACKEND** (restricción del proyecto)

## Estado Actual del Código Backend (READ ONLY)

```typescript
// backend/src/index.ts - LÍNEA 110
app.use('/api/admin', adminRoutes); // ❌ Falta authMiddleware

// backend/src/admin/presentation/routes/admin.routes.ts
router.post("/canchas", requireRole("dueno", "admin", "superadmin"), ...);

// backend/src/admin/presentation/guards/guards.ts
export const requireRole = (...roles) => (req, res, next) => {
  const role = req?.user?.rol;  // ⚠️ req.user está undefined
  if (!role) return res.status(401).json(fail(401, "No autenticado"));
  ...
};
```

## Soluciones Posibles

### ✅ Opción 1: Contactar al equipo Backend (RECOMENDADO)

**Pedir que agreguen:**
```typescript
// backend/src/index.ts
import { authMiddleware } from './auth/middlewares/authMiddleware';
app.use('/api/admin', authMiddleware, adminRoutes);
```

Este cambio hace que el flujo sea:
1. Request → `/api/admin/canchas` con `Authorization: Bearer <token>`
2. `authMiddleware` → Decodifica JWT, extrae `{sub: "34", role: "dueno"}`, lo coloca en `req.user`
3. `requireRole("dueno", ...)` → Lee `req.user.rol`, verifica que sea "dueno" ✅
4. Controller → Procesa la petición

### ⚠️ Opción 2: Investigar Endpoint Alternativo

Verificar con el equipo de backend si existe un endpoint alternativo que sí funcione, o si el usuario necesita permisos adicionales en la base de datos.

## Verificación del Problema

```bash
# 1. Verificar que el token es válido:
localStorage.getItem('access_token')
# Resultado: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

# 2. Decodificar el token en jwt.io:
{
  "sub": "34",
  "role": "dueno",
  "exp": 1760595381
}

# 3. Verificar logs del navegador:
🔐 [canchaService] Estado de autenticación: {hasToken: true, tokenLength: 140}
🔐 [apiBackend] Interceptor request: {hasToken: true}
❌ POST http://localhost:4000/api/admin/canchas 401 (Unauthorized)
⚠️ [apiBackend] Error 401 - No autenticado
```

## Recomendación Final

### ✅ SOLUCIÓN CORRECTA (Requiere cambio en Backend)

**Contactar al equipo de backend** y pedirles que:

1. **Agreguen `authMiddleware` antes de montar las rutas `/api/admin`**:
   ```typescript
   // backend/src/index.ts - LÍNEA 110
   import { authMiddleware } from './auth/middlewares/authMiddleware';
   app.use('/api/admin', authMiddleware, adminRoutes); // ← AGREGAR authMiddleware
   ```

2. **Verifiquen que el usuario `dueno.cancha@gmail.com` (ID 34) tenga rol "dueno" en la base de datos**

3. **Prueben el endpoint con curl**:
   ```bash
   curl -X POST http://localhost:4000/api/admin/canchas \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN>" \
     -d '{"nombre":"Test","deporte":"futbol","capacidad":10,"precio_desde":5000,"cubierta":false,"activo":true,"id_complejo":1}'
   ```

### ⚠️ NO HACER (Soluciones incorrectas)

- ❌ NO modificar el frontend para saltarse la autenticación
- ❌ NO usar datos simulados/mock en producción
- ❌ NO remover validaciones de seguridad
- ❌ NO hardcodear tokens de acceso
- ❌ NO desactivar middleware de autenticación

### 📋 Para el Equipo de Backend

Este es un bug de configuración donde:
- El middleware `authMiddleware` **existe** en `backend/src/auth/middlewares/authMiddleware.ts`
- El guard `requireRole` **existe** en `backend/src/admin/presentation/guards/guards.ts`
- Pero `authMiddleware` **NO está aplicado** antes de las rutas `/api/admin`
- Resultado: `req.user` nunca se popula → `requireRole` siempre retorna 401

**Fix necesario**: 1 línea de código en `backend/src/index.ts` línea 110

## Enlaces Útiles

- JWT Debugger: https://jwt.io
- Código authMiddleware: `backend/src/auth/middlewares/authMiddleware.ts`
- Código requireRole: `backend/src/admin/presentation/guards/guards.ts`
- Rutas admin: `backend/src/admin/presentation/routes/admin.routes.ts`
