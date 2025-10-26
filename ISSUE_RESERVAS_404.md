# 🐛 ISSUE: GET /api/reservas retorna 404 (Not Found)

**Fecha:** 26 de octubre de 2025  
**Reportado por:** Frontend Team  
**Severidad:** 🔴 ALTA - Funcionalidad bloqueada  
**Módulo afectado:** Admin Panel - Gestión de Reservas  

---

## 📋 Resumen del Problema

El endpoint `GET /api/reservas` está retornando un error **404 (Not Found)** cuando se intenta listar las reservas desde el panel de administración, a pesar de que:

- ✅ El endpoint está definido en el código del BFF
- ✅ Las rutas están correctamente montadas
- ✅ El endpoint de status funciona: `GET /api/reservas/status` retorna 200 OK
- ✅ La autenticación funciona: `GET /api/auth/me` retorna 200 OK
- ✅ Otros endpoints admin funcionan correctamente

---

## 🔍 Evidencia Detallada

### 1. Petición Frontend

**URL solicitada:**
```
GET http://localhost:4000/api/reservas
```

**Headers enviados:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Usuario autenticado:**
```json
{
  "id_usuario": 34,
  "email": "dueno.cancha@gmail.com",
  "rol": "admin",
  "nombre": "dueno"
}
```

### 2. Respuesta del Backend

**Status Code:** `404 Not Found`

**Response Body:**
```json
{
  "ok": false,
  "error": {
    "code": 404,
    "message": "Not Found",
    "details": {
      "detail": "Not Found"
    }
  }
}
```

### 3. Logs del Browser Console

```javascript
// ✅ Petición se construye correctamente
🔍 [getAdminReservas] Iniciando petición con filtros: undefined
🔍 [getAdminReservas] URL base: http://localhost:4000/api
🔍 [getAdminReservas] Ruta: /reservas
🔍 [getAdminReservas] URL completa esperada: http://localhost:4000/api/reservas

// ❌ Respuesta con 404
GET http://localhost:4000/api/reservas 404 (Not Found)

// ❌ Error procesado por interceptor
📥 [apiBackend] Response: {url: '/reservas', status: 404, dataType: 'object', isArray: false, hasOkProperty: true}
🔍 [apiBackend] Respuesta con estructura {ok, data}: {ok: false, hasData: false, dataType: 'undefined', dataKeys: Array(0)}
❌ [apiBackend] Error del BFF: Not Found {ok: false, error: {…}}
```

### 4. Logs del Backend (Docker)

```
backend-1   | 🚀 Servidor BFF iniciado correctamente
backend-1   | 📍 URL: http://localhost:4000
backend-1   | 🔗 Endpoints disponibles:
backend-1   |    - GET  /api/reservas  ✅ (listado en documentación)
backend-1   |    - GET  /api/auth/me   ✅ (funciona correctamente)
```

**CRÍTICO:** NO HAY LOGS de la petición `GET /api/reservas` llegando al backend.

Comparación:
```
// ✅ /auth/me FUNCIONA - logs presentes:
backend-1   | 🔍 CORS Request from origin: http://localhost:3000
backend-1   | ✅ CORS: Origin permitido (lista exacta): http://localhost:3000
backend-1   | ✅ [authMiddleware] Token presente: { sub: '34', role: 'admin', ... }
backend-1   | 🔄 [authMiddleware] Normalizando role → rol: admin → admin

// ❌ /api/reservas NO FUNCIONA - sin logs:
[NINGÚN LOG DEL BACKEND PARA ESTA PETICIÓN]
```

### 5. Formato del Error 404

**Discrepancia crítica:** El formato del error 404 NO coincide con el handler personalizado del BFF.

**Handler del BFF** (`backend/src/index.ts` líneas 306-312):
```typescript
app.use('*', (req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});
```

**Error real recibido:**
```json
{
  "ok": false,
  "error": {
    "code": 404,
    "message": "Not Found",
    "details": { "detail": "Not Found" }
  }
}
```

**Conclusión:** El 404 proviene de **ANTES** del BFF (Node.js/Express), posiblemente:
- ❓ FastAPI directamente
- ❓ Nginx/Proxy
- ❓ Middleware que intercepta antes de llegar al router

---

## 🔧 Configuración Verificada

### Backend Routes (`backend/src/reservas/presentation/routes/reservas.routes.ts`)

**Línea 202:** Endpoint definido correctamente
```typescript
/** GET /reservas - Listado de reservas (admin/superadmin) */
router.get("/", authMiddleware, requireRole("admin", "super_admin"), (req, res) => 
  ctrl(req).list(req, res)
);
```

### Route Mounting (`backend/src/index.ts`)

**Línea 180:** Rutas montadas correctamente
```typescript
app.use('/api/reservas', reservasRoutes);
```

### Controller (`backend/src/reservas/presentation/controllers/reservas.controller.ts`)

**Líneas 45-64:** Método `list` implementado
```typescript
async list(req: Request, res: Response) {
  const filters = this.extractFilters(req);
  const result = await this.listReservasUC.execute(filters);
  res.json(ok(result));  // Formato: {ok: true, data: result}
}
```

---

## ✅ Endpoints que SÍ Funcionan

Para descartar problemas de autenticación/autorización:

| Endpoint | Método | Status | Rol Requerido | Funciona |
|----------|--------|--------|---------------|----------|
| `/api/auth/me` | GET | 200 OK | Cualquier auth | ✅ |
| `/api/reservas/status` | GET | 200 OK | Público | ✅ |
| `/api/admin/users` | GET | 200 OK | admin | ✅ |
| `/api/canchas` | GET | 200 OK | admin | ✅ |
| `/api/reservas` | GET | **404** | admin/super_admin | ❌ |
| `/api/reservas/mias` | GET | ❓ | Cualquier auth | No probado |

---

## 🧪 Pruebas Realizadas

### Test 1: Verificar endpoint con curl
```bash
curl -X GET "http://localhost:4000/api/reservas/status" \
  -H "Authorization: Bearer <token>"

# ✅ Resultado: 200 OK
{
  "ok": true,
  "data": {
    "available_endpoints": [...]
  }
}
```

### Test 2: Verificar autenticación
```bash
curl -X GET "http://localhost:4000/api/auth/me" \
  -H "Authorization: Bearer <token>"

# ✅ Resultado: 200 OK
{
  "ok": true,
  "data": {
    "email": "dueno.cancha@gmail.com",
    "rol": "admin"
  }
}
```

### Test 3: Listar reservas
```bash
curl -X GET "http://localhost:4000/api/reservas" \
  -H "Authorization: Bearer <token>"

# ❌ Resultado: 404 Not Found
{
  "ok": false,
  "error": {
    "code": 404,
    "message": "Not Found"
  }
}
```

---

## 🔎 Posibles Causas

### 1. Middleware `requireRole` bloqueando antes de llegar al handler
- ❓ El middleware podría estar retornando 404 en lugar de 403
- ❓ El middleware podría no estar procesando correctamente el rol "admin"

### 2. Orden de rutas conflictivo
Verificar si hay otra ruta que intercepte antes:
```typescript
router.get("/mias", ...)      // Línea 199 - Específica
router.get("/", ...)          // Línea 202 - General (404 issue)
router.get("/:id", ...)       // Línea 205 - Parámetro
```

### 3. FastAPI no tiene el endpoint
Si el BFF hace proxy a FastAPI, verificar:
```python
# FastAPI debe tener:
@router.get("/reservas")
async def listar_reservas(...):
    ...
```

### 4. CORS Preflight bloqueando
Aunque unlikely porque `/auth/me` funciona

### 5. Proxy/Nginx configuración
Si hay un proxy entre frontend y BFF

---

## 🛠️ Acciones Solicitadas al Backend Team

### 1. ⚠️ CRÍTICO: Verificar logs del BFF
```bash
# Ejecutar y compartir logs completos:
docker-compose logs backend -f
```

Buscar específicamente:
- ¿Llega la petición GET /api/reservas?
- ¿Qué middleware procesa la petición?
- ¿Hay algún error antes del handler?

### 2. ⚠️ CRÍTICO: Verificar middleware `requireRole`

**Archivo:** `backend/src/auth/middlewares/requireRole.ts`

Verificar que:
- ✅ Retorna 403 (Forbidden) NO 404 cuando falta permiso
- ✅ Acepta tanto "admin" como "super_admin"
- ✅ Normaliza correctamente el rol del token JWT

Ejemplo esperado:
```typescript
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.rol || req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ error: 'No autorizado' }); // NO 404
    }
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Sin permisos' }); // NO 404
    }
    
    next();
  };
};
```

### 3. ⚠️ Verificar que FastAPI tiene el endpoint

Si el BFF hace proxy a FastAPI:

**Archivo:** `api/routers/reservas.py` (o similar)

```python
@router.get("/reservas")
async def listar_reservas(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verificar que este endpoint existe
    ...
```

### 4. Test directo con Postman/Insomnia

Compartir captura de pantalla de:
```
GET http://localhost:4000/api/reservas
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 5. Compartir configuración de proxy (si existe)

- `nginx.conf`
- Configuración de rewrites
- Cualquier middleware de routing

---

## 📊 Impacto

### Funcionalidades Bloqueadas
- ❌ Listar reservas en panel admin
- ❌ Filtrar reservas por estado/fecha
- ❌ Gestión completa de reservas

### Funcionalidades que SÍ Funcionan
- ✅ Login/autenticación
- ✅ Crear reservas
- ✅ Listar canchas
- ✅ Panel admin (otras secciones)

---

## 📝 Información Adicional

### Versiones
- **Node.js:** (verificar con `node -v`)
- **TypeScript:** 5.9.2
- **Express:** (verificar en package.json)
- **Axios:** (frontend)
- **Docker:** Compose v2

### Variables de Entorno
```env
NODE_ENV=development
API_BASE_URL=http://api-h1d7oi-a881cc-168-232-167-73.traefik.me/
BFF_PORT=4000
```

### Peticiones Paralelas
**Nota importante:** El frontend hace dos peticiones en paralelo:
1. `GET /api/reservas` → 404 ❌
2. `GET /api/auth/me` → 200 ✅

Ambas con el mismo token, mismo origen, mismo momento.

---

## 🆘 Workaround Temporal (Frontend)

Mientras se resuelve, el frontend podría:

### Opción 1: Usar endpoint alternativo
```typescript
// En lugar de GET /api/reservas
// Usar GET /api/reservas/mias con filtro
const { data } = await apiBackend.get('/reservas/mias', { 
  params: { incluir_todas: true } 
});
```

### Opción 2: Llamar directamente a FastAPI
```typescript
// Bypass del BFF (solo temporal)
const response = await axios.get(
  'http://api-h1d7oi-a881cc-168-232-167-73.traefik.me/reservas',
  { headers: { Authorization: `Bearer ${token}` } }
);
```

---

## 📞 Contacto

**Reportado por:** Frontend Team  
**Para resolver consultas:** [Tu email/Slack]  
**Canal Slack:** #backend-support  
**Issue tracking:** [Link si usan Jira/GitHub Issues]

---

## ✅ Checklist de Resolución

- [ ] Revisar logs del BFF cuando llega la petición
- [ ] Verificar middleware `requireRole` retorna códigos correctos
- [ ] Confirmar que FastAPI tiene `GET /reservas`
- [ ] Test manual con Postman/curl
- [ ] Verificar orden de rutas en Express
- [ ] Revisar configuración de proxy (si existe)
- [ ] Compartir respuesta completa de FastAPI
- [ ] Fix implementado y desplegado
- [ ] Frontend confirmó que funciona

---

**Última actualización:** 26 de octubre de 2025, 21:30  
**Estado:** 🔴 PENDIENTE RESOLUCIÓN BACKEND
