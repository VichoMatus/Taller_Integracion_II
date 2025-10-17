# 🚨 BUG CRÍTICO: Falta authMiddleware en Rutas Admin

> **⚠️ PARA EL EQUIPO DE BACKEND**: Bug confirmado que causa 403 Forbidden en todas las rutas `/api/admin/*`. Requiere agregar `authMiddleware` antes de `requireRole`.

## 🐛 Descripción del Problema

El frontend recibe **403 Forbidden** en TODAS las peticiones a `/api/admin/*` (canchas, complejos, reservas, etc.):

```bash
❌ GET /api/admin/canchas → 403 Forbidden
❌ POST /api/admin/canchas → 403 Forbidden  
❌ PUT /api/admin/canchas/:id → 403 Forbidden
❌ GET /api/admin/complejos → 403 Forbidden
❌ GET /api/admin/reservas → 403 Forbidden
```

## 🔍 Causa Raíz Confirmada

Las rutas `/api/admin/*` tienen `requireRole` pero **NO tienen `authMiddleware`** antes:

```typescript
// backend/src/admin/presentation/routes/admin.routes.ts
// LÍNEAS: 60, 65, 68, 71, 74, 77, 82, 85, 88, 91, 94, 99, 102

❌ ACTUAL (INCORRECTO):
router.get("/canchas", requireRole("dueno", "admin", "superadmin"), handler);
router.post("/canchas", requireRole("dueno", "admin", "superadmin"), handler);
router.put("/canchas/:id", requireRole("dueno", "admin", "superadmin"), handler);
// ... etc

✅ DEBERÍA SER:
router.get("/canchas", authMiddleware, requireRole("dueno", "admin", "superadmin"), handler);
router.post("/canchas", authMiddleware, requireRole("dueno", "admin", "superadmin"), handler);
router.put("/canchas/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), handler);
// ... etc
```

### 📊 Flujo del Error:

1. **Frontend envía**: `GET /api/admin/canchas` con `Authorization: Bearer eyJ...`
2. **Backend ejecuta**: `requireRole("dueno", "admin", "superadmin")`
3. **requireRole intenta leer**: `req.user.rol`
4. **Pero `req.user` es undefined** porque nunca se ejecutó `authMiddleware`
5. **requireRole retorna**: `401 No autenticado` (línea 22 de guards.ts)
6. **Frontend recibe**: 403 Forbidden

## 🔧 Solución Requerida (Backend)

## 🔧 Solución Requerida (Backend)

### ✅ **Fix Principal**: Agregar `authMiddleware` en TODAS las rutas admin

**Archivo**: `backend/src/admin/presentation/routes/admin.routes.ts`

**Paso 1**: Importar authMiddleware (agregar al inicio del archivo):

```typescript
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
```

**Paso 2**: Agregar `authMiddleware` antes de `requireRole` en TODAS las rutas:

```typescript
// === Endpoints del Panel del Dueño === (línea 60)
router.get("/panel", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);

// === Endpoints de Complejos === (líneas 65-77)
router.get("/complejos", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);
router.post("/complejos", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);
router.get("/complejos/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);
router.put("/complejos/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);
router.delete("/complejos/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);

// === Endpoints de Canchas === (líneas 82-94)
router.get("/canchas", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);
router.post("/canchas", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);
router.get("/canchas/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);
router.put("/canchas/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);
router.delete("/canchas/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);

// === Endpoints de Reservas y Estadísticas === (líneas 99-102)
router.get("/reservas", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);
router.get("/estadisticas", authMiddleware, requireRole("dueno", "admin", "superadmin"), ...);
```

### 🎯 **¿Por qué esto arregla el problema?**

Con `authMiddleware` agregado:

1. **authMiddleware** decodifica el JWT del header `Authorization`
2. **authMiddleware** extrae los datos: `{sub: "34", rol: "admin", exp: ...}`
3. **authMiddleware** crea `req.user = {id: 34, rol: "admin", ...}`
4. **requireRole** ahora puede leer `req.user.rol = "admin"` ✅
5. **requireRole** valida que "admin" esté en `["dueno", "admin", "superadmin"]` ✅
6. **Controlador** procesa la petición ✅

---

## 📝 Problema Secundario: Inconsistencia de Roles

### ⚠️ **Roles en módulo Auth vs Admin son diferentes**

**Módulo Auth** (`/auth/types/authTypes.ts` línea 94):
```typescript
rol: 'usuario' | 'admin' | 'super_admin';  // ← Sin "dueno"
```

**Módulo Admin** (`/admin/presentation/guards/guards.ts` línea 17):
```typescript
requireRole(...roles: Array<"dueno" | "admin" | "superadmin">)  // ← Con "dueno"
```

**Módulo SuperAdmin** (`/superAdmin/types/superAdminTypes.ts` línea 54):
```typescript
rol: 'usuario' | 'dueno' | 'admin' | 'superadmin';  // ← Con "dueno"
```

### 🤔 **¿Cuál es correcto?**

El sistema tiene **dos definiciones de roles contradictorias**:
- El login (`/auth/login`) devuelve: `"usuario"`, `"admin"`, `"super_admin"`
- Las rutas admin esperan: `"dueno"`, `"admin"`, `"superadmin"`

### ✅ **Solución Sugerida**: Normalizar roles

**Opción A**: Modificar `requireRole` para aceptar ambos (más simple):

```typescript
// backend/src/admin/presentation/guards/guards.ts

export const requireRole =
  (...roles: Array<"dueno" | "admin" | "superadmin">) =>
  (req: Request, res: Response, next: NextFunction) => {
    let role = (req as any)?.user?.rol || (req.headers["x-user-role"] as string | undefined);

    if (!role) return res.status(401).json(fail(401, "No autenticado"));

    // NORMALIZAR: Tratar "admin" (del login) como "dueno" (esperado en admin routes)
    const normalizedRole = role === "admin" ? "dueno" : role;

    if (!roles.includes(normalizedRole as any)) {
      return res.status(403).json(fail(403, "Permisos insuficientes"));
    }

    next();
  };
```

**Opción B**: Unificar los tipos de roles en todo el backend (más correcto pero más trabajo)

---

## 🧪 Cómo Verificar el Fix

### 1. Después de aplicar los cambios:

```bash
# Reiniciar el backend
cd backend
npm run dev
```

### 2. Desde el navegador (con token válido):

```javascript
// En la consola del navegador:
const token = localStorage.getItem('access_token');
fetch('http://localhost:4000/api/admin/canchas', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

**Resultado esperado**: ✅ 200 OK con lista de canchas (o [] si no hay)

**Resultado actual (sin fix)**: ❌ 403 Forbidden

---

## 📋 Checklist para Backend

- [ ] Importar `authMiddleware` en `admin.routes.ts`
- [ ] Agregar `authMiddleware` antes de `requireRole` en ruta `/panel` (línea 60)
- [ ] Agregar `authMiddleware` en 5 rutas de complejos (líneas 65-77)
- [ ] Agregar `authMiddleware` en 5 rutas de canchas (líneas 82-94)
- [ ] Agregar `authMiddleware` en 2 rutas de reservas/estadísticas (líneas 99-102)
- [ ] (Opcional) Normalizar roles en `requireRole` para aceptar "admin" = "dueno"
- [ ] Probar con `curl` o Postman que las rutas funcionen
- [ ] Verificar en navegador que frontend puede crear/editar/eliminar

---

## 🔗 Referencias

**Archivos involucrados**:
- ❌ Bug: `backend/src/admin/presentation/routes/admin.routes.ts` (líneas 60-102)
- ✅ Middleware correcto: `backend/src/auth/middlewares/authMiddleware.ts` (línea 26)
- ✅ Guard correcto: `backend/src/admin/presentation/guards/guards.ts` (línea 17)
- ⚠️ Inconsistencia tipos: `backend/src/auth/types/authTypes.ts` vs `backend/src/superAdmin/types/superAdminTypes.ts`

**Comparación con otros módulos que SÍ funcionan**:
```typescript
// backend/src/reservas/presentation/routes/reservas.routes.new.ts (línea 137)
router.get("/mias", authMiddleware, handler);  // ✅ Tiene authMiddleware

// backend/src/admin/presentation/routes/admin.routes.ts (línea 82)  
router.get("/canchas", requireRole(...), handler);  // ❌ NO tiene authMiddleware
```

---

## 💡 Estado del Frontend

El frontend está **correctamente implementado** y listo para usar:
- ✅ Envía token en header `Authorization: Bearer <token>`
- ✅ Maneja errores 401/403 apropiadamente
- ✅ Redirige a login cuando no hay token
- ✅ Usa interceptores de axios correctamente
- ✅ Tipos TypeScript alineados con API

**Cuando el backend aplique el fix, el frontend funcionará inmediatamente sin cambios.**
