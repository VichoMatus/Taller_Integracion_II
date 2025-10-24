# Reporte de Errores en Endpoints de Admin del Backend

**Fecha:** 24 de octubre de 2025  
**Reportado por:** Equipo Frontend  
**Rama:** frontend/admin  
**Prioridad:** CRÍTICA 🔴🔴🔴

---

## Resumen Ejecutivo

**ACTUALIZACIÓN FINAL:** ~~DOS~~ **UN PROBLEMA CRÍTICO** detectado:

1. ✅ ~~**ENDPOINTS DE RESERVAS NO EXISTEN EN BFF**~~ → **RESUELTO** - Los endpoints están implementados y funcionan
2. ❌ **ENDPOINTS DE ADMIN FALLAN POR JWT** - Los endpoints `/api/admin/canchas` fallan por extracción incorrecta del user ID del JWT
3. ⚠️ **LISTADO DE RESERVAS NO CARGA** - El frontend no recibe datos al listar reservas (necesita investigación)

**Estado Actual:** 
- ⚠️ Gestión de reservas: Endpoints existen pero **lista vacía** (puede ser normal si no hay datos, o error de backend)
- ✅ Crear reserva: **FUNCIONA** correctamente
- ⚠️ Gestión de canchas de admin: Usando workaround temporal (endpoints generales sin filtrado)

**Acciones Requeridas:**
1. Verificar si hay reservas en la base de datos FastAPI
2. Si no hay datos: crear reservas de prueba
3. Si hay datos: investigar por qué el BFF no las devuelve

---

## PROBLEMA 1: ~~ENDPOINTS DE RESERVAS NO IMPLEMENTADOS EN BFF~~ ✅ RESUELTO

### ~~🐛 Error Crítico~~ ✅ **ACTUALIZACIÓN: ENDPOINTS SÍ EXISTEN**

**Estado anterior:** GET http://localhost:4000/api/reservas → 404 Not Found  
**Estado actual:** ✅ **ENDPOINTS FUNCIONANDO CORRECTAMENTE**

### 🎉 Confirmación:

Los endpoints de reservas **SÍ están implementados** en el BFF (backend Node.js en puerto 4000).

**Logs del backend confirmando disponibilidad:**
```
🚀 Servidor BFF iniciado correctamente
📍 URL: http://localhost:4000
🔗 Endpoints disponibles:
   - GET  /api/reservas                          ← ✅ EXISTE
   - POST /api/reservas/verificar-disponibilidad ← ✅ EXISTE
```

**Request exitoso desde frontend:**
```
backend-1   | ✅ [authMiddleware] Token presente: { sub: '34', role: 'admin', ... }
backend-1   | 🔄 [authMiddleware] Normalizando role → rol: admin → admin
frontend-1  | GET /admin/reservas 200 in 564ms   ← ✅ FUNCIONANDO
```

### 📊 Endpoints de Reservas CONFIRMADOS en BFF:

Según `backend/src/reservas/presentation/routes/reservas.routes.ts` (líneas 167-218):

```typescript
// Endpoints Administrativos (Panel) - /api/reservas/admin/*
router.get("/admin/cancha/:canchaId", authMiddleware, requireRole("admin", "super_admin"), ...);
router.get("/admin/usuario/:usuarioId", authMiddleware, requireRole("admin", "super_admin"), ...);
router.post("/admin/crear", authMiddleware, requireRole("admin", "super_admin"), ...);
router.post("/admin/:id/cancelar", authMiddleware, requireRole("admin", "super_admin"), ...);

// Endpoints Normales - /api/reservas/*
router.get("/mias", authMiddleware, ...);                  // Mis reservas
router.get("/", authMiddleware, requireRole("admin", "super_admin"), ...);  // Lista todas (admin)
router.get("/:id", authMiddleware, ...);                   // Detalle
router.post("/cotizar", authMiddleware, ...);              // Cotizar
router.post("/", authMiddleware, ...);                     // Crear
router.patch("/:id", authMiddleware, ...);                 // Editar
router.post("/:id/confirmar", authMiddleware, requireRole("admin", "super_admin"), ...);
router.post("/:id/cancelar", authMiddleware, ...);         // Cancelar
```

**Registrado en `backend/src/index.ts` línea 180:**
```typescript
app.use('/api/reservas', reservasRoutes);  ← ✅ MONTADO CORRECTAMENTE
```

### ❌ ~~Endpoints de Reservas en BFF (NO EXISTEN)~~ → ✅ **SÍ EXISTEN Y FUNCIONAN**

El BFF expone correctamente:
- ✅ `/api/auth/*` (autenticación)
- ✅ `/api/admin/canchas` (canchas de admin - PERO FALLA, ver Problema 2)
- ✅ `/api/canchas` (canchas públicas)  
- ✅ **`/api/reservas`** ← **¡FUNCIONA!**
- ✅ **`/api/reservas/admin/*`** ← **¡FUNCIONAN!**

### ~~🎯 Endpoint Específico Requerido por Frontend~~ → ✅ **YA IMPLEMENTADO**

El endpoint que el frontend necesita **YA EXISTE y FUNCIONA**:

```typescript
GET /api/reservas
Authorization: Bearer <token>
Headers: role verificado por requireRole("admin", "super_admin")

Response: Array de reservas desde FastAPI
```

**Implementación en BFF:**
```typescript
// backend/src/reservas/presentation/routes/reservas.routes.ts:187
router.get("/", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).list(req, res));
```

Este endpoint:
- ✅ Verifica autenticación (authMiddleware)
- ✅ Verifica rol admin/super_admin (requireRole)
- ✅ Hace proxy a FastAPI `/api/v1/reservas`
- ✅ Devuelve array de reservas

### ⚠️ **PROBLEMA REAL:** Configuración de URL del Frontend

**El verdadero problema detectado:**

El frontend en Docker detecta que está en servidor y se conecta al backend de **producción** en lugar de localhost:

```
frontend-1  | 🖥️ [getBackendUrl] SERVIDOR → PRODUCCIÓN  
frontend-1  | BACKEND_BASE_URL: https://backend-mn66n6-82bd05-168-232-167-73.traefik.me  ← ❌ PRODUCCIÓN
```

Debería usar:
```
BACKEND_BASE_URL: http://localhost:4000  ← ✅ LOCAL
```

**Solución temporal:** Acceder desde el navegador a `http://localhost:3000/admin/reservas` para que detecte correctamente localhost.

### 📊 Endpoints de Reservas en FastAPI (funcionando):

Según la documentación de FastAPI en `/docs`:

```
GET    /api/v1/reservas/mis                                  Mis reservas
GET    /api/v1/reservas                                      Listado de reservas (admin/superadmin)
POST   /api/v1/reservas                                      Crear reserva
GET    /api/v1/reservas/{id_reserva}                        Detalle de reserva
PATCH  /api/v1/reservas/{id_reserva}                        Reprogramar / editar
POST   /api/v1/reservas/cotizar                             Cotizar reserva (precio)
POST   /api/v1/reservas/{id_reserva}/confirmar             Confirmar (admin/superadmin)
POST   /api/v1/reservas/{id_reserva}/cancelar              Cancelar reserva
GET    /api/v1/reservas/reservas/admin/cancha/{id_cancha}  (Panel) Reservas por cancha
GET    /api/v1/reservas/reservas/admin/usuario/{id_usuario} (Panel) Reservas por usuario
POST   /api/v1/reservas/reservas/admin/crear              (Panel) Crear reserva como admin
POST   /api/v1/reservas/reservas/admin/{id_reserva}/cancelar (Panel) Cancelar reserva
```

### ❌ Endpoints de Reservas en BFF (NO EXISTEN):

El BFF solo expone endpoints de:
- ✅ `/api/auth/*` (autenticación)
- ✅ `/api/admin/canchas` (canchas de admin - PERO FALLA, ver Problema 2)
- ✅ `/api/canchas` (canchas públicas)
- ❌ **NO HAY `/api/reservas`** ← Endpoint general que intentamos usar
- ❌ **NO HAY `/api/admin/reservas`** ← Endpoint con filtro por admin que NECESITAMOS

### 🎯 Endpoint Específico Requerido por Frontend:

El frontend espera este endpoint en el BFF:

```typescript
GET /api/admin/reservas
Authorization: Bearer <token>

// Debe:
// 1. Extraer user_id del JWT (req.user.sub)
// 2. Buscar complejo_id del usuario
// 3. Filtrar reservas de canchas de ese complejo
// 4. Devolver solo reservas relacionadas al admin

Response: {
  ok: true,
  data: [
    {
      id_reserva: number,
      id_usuario: number,
      id_cancha: number,
      fecha_reserva: string,
      hora_inicio: string,
      hora_fin: string,
      estado: 'pendiente' | 'confirmada' | 'cancelada',
      precio_total: number,
      notas: string,
      // Opcional: datos relacionados
      cancha?: { nombre: string, ... },
      usuario?: { nombre: string, ... }
    }
  ]
}
```

**Lógica esperada en BFF:**

```typescript
// backend/src/reservas/presentation/controllers/reserva.controller.ts
async getAdminReservas(req: Request, res: Response) {
  try {
    // 1. Extraer user_id del JWT (¡usar req.user.sub, no req.user.id!)
    const userId = req.user?.sub;
    
    // 2. Obtener complejo del admin
    const admin = await getUserById(userId);
    const complejoId = admin.id_complejo;
    
    // 3. Obtener canchas del complejo
    const canchas = await getCanchasByComplejo(complejoId);
    const canchaIds = canchas.map(c => c.id_cancha);
    
    // 4. Filtrar reservas de esas canchas
    const reservas = await getReservasByCanchas(canchaIds);
    
    res.json({ ok: true, data: reservas });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
```

### 🔍 Evidencia del Error:

**Intento 1: Endpoint con filtro de admin (`/admin/reservas`):**

```
Console Log:
🔐 [apiBackend] Interceptor request: {
  url: '/admin/reservas', 
  method: 'get', 
  hasToken: true, 
  baseURL: 'http://localhost:4000/api'
}

GET http://localhost:4000/api/admin/reservas 404 (Not Found)

📥 [apiBackend] Response: {
  url: '/admin/reservas', 
  status: 404,
  error: 'Endpoint no encontrado'
}
```

**Intento 2: Fallback a endpoint general (`/reservas`):**

```
Console Log:
🔐 [apiBackend] Interceptor request: {
  url: '/reservas', 
  method: 'get', 
  hasToken: true, 
  baseURL: 'http://localhost:4000/api'
}

GET http://localhost:4000/api/reservas 404 (Not Found)

📥 [apiBackend] Response: {
  url: '/reservas', 
  status: 404, 
  dataType: 'object', 
  isArray: false, 
  hasOkProperty: true
}

Respuesta completa del servidor: {ok: false, error: {…}}
Formato inesperado de respuesta: {ok: false, error: {…}}
📊 Total de reservas procesadas: 0
```

**Código frontend que falla:**

```typescript
// sporthub-temuco/src/services/reservaService.ts
async getAdminReservas(filters?: ReservaFilters): Promise<Reserva[]> {
  try {
    // ❌ ESTO DEVUELVE 404 - El endpoint no existe en BFF
    const { data } = await apiBackend.get('/admin/reservas', { params: filters });
    return data;
  } catch (err) {
    // ⚠️ Frontend cae aquí porque BFF no tiene el endpoint
    handleApiError(err); // Muestra: "Error al cargar reservas"
  }
}
```

**Workaround temporal aplicado:**

```typescript
// TODO: Cambiar a /admin/reservas cuando el backend implemente el endpoint
// Temporalmente usando /reservas (que tampoco existe, devuelve 404)
const { data } = await apiBackend.get('/reservas', { params: filters });
```

**Resultado:** ❌ Ambos endpoints fallan → Panel de reservas completamente roto

### ✅ Soluciones Posibles:

#### Opción 1: Implementar endpoints de reservas en BFF (RECOMENDADO)

Crear en el BFF los siguientes archivos/rutas:

```
backend/src/reservas/
├── routes/
│   └── reserva.routes.ts          # Rutas de reservas
├── presentation/
│   └── controllers/
│       └── reserva.controller.ts  # Controlador
├── application/
│   └── usecases/
│       └── GetReservasUseCase.ts
└── infrastructure/
    └── repositories/
        └── ReservaApiRepository.ts # Proxy a FastAPI
```

**Implementación necesaria en `backend/src/index.ts`:**

```typescript
import reservaRoutes from './reservas/routes/reserva.routes';

// Registrar rutas
app.use('/api/reservas', reservaRoutes);
app.use('/api/admin/reservas', authMiddleware, reservaRoutes); // Con auth
```

**Endpoints mínimos a implementar en BFF:**

```typescript
// reserva.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../auth/middlewares/auth.middleware';

const router = Router();

// Endpoints públicos
router.get('/', getAllReservas);           // GET /api/reservas
router.post('/', createReserva);           // POST /api/reservas
router.get('/:id', getReservaById);        // GET /api/reservas/:id
router.put('/:id', updateReserva);         // PUT /api/reservas/:id
router.delete('/:id', deleteReserva);      // DELETE /api/reservas/:id

// Endpoints de admin (CON FILTRADO POR COMPLEJO) ← CRÍTICO
router.get('/admin/reservas', authMiddleware, getAdminReservas);  // ← EL QUE NECESITAMOS
router.get('/admin/cancha/:id', authMiddleware, getReservasByCancha);
router.get('/admin/usuario/:id', authMiddleware, getReservasByUsuario);
router.post('/admin/crear', authMiddleware, createReservaAdmin);
```

**Controlador para el endpoint de admin CON FILTRO:**

```typescript
// reserva.controller.ts
export async function getAdminReservas(req: Request, res: Response) {
  try {
    // IMPORTANTE: Usar req.user.sub, NO req.user.id (ver Problema 2)
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ 
        ok: false, 
        error: 'Usuario no autenticado' 
      });
    }

    console.log('🔍 [ReservaController] Obteniendo reservas para user_id:', userId);

    // 1. Obtener datos del admin desde FastAPI
    const userResponse = await fastApiClient.get(`/api/v1/usuarios/${userId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    const complejoId = userResponse.data.id_complejo;
    
    if (!complejoId) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Usuario no asociado a un complejo' 
      });
    }

    console.log('🏢 [ReservaController] Complejo del admin:', complejoId);

    // 2. Obtener canchas del complejo
    const canchasResponse = await fastApiClient.get('/api/v1/canchas', {
      params: { complejo_id: complejoId },
      headers: { Authorization: req.headers.authorization }
    });
    const canchaIds = canchasResponse.data.map((c: any) => c.id_cancha);
    
    console.log('🎾 [ReservaController] Canchas del complejo:', canchaIds);

    // 3. Obtener reservas de esas canchas
    const reservasResponse = await fastApiClient.get('/api/v1/reservas', {
      headers: { Authorization: req.headers.authorization }
    });
    
    // 4. Filtrar reservas por canchas del complejo
    const reservasFiltradas = reservasResponse.data.filter((r: any) => 
      canchaIds.includes(r.id_cancha)
    );

    console.log('✅ [ReservaController] Reservas filtradas:', reservasFiltradas.length);

    res.json({ 
      ok: true, 
      data: reservasFiltradas 
    });
    
  } catch (error) {
    console.error('❌ [ReservaController] Error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Error al obtener reservas del admin' 
    });
  }
}
```

**Repository para llamar a FastAPI:**

```typescript
// ReservaApiRepository.ts
export class ReservaApiRepository {
  private fastApiClient = axios.create({
    baseURL: process.env.FASTAPI_URL || 'http://fastapi:8000',
  });

  async getAllReservas(token: string): Promise<Reserva[]> {
    const response = await this.fastApiClient.get('/api/v1/reservas', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
  
  async getReservasByComplejo(complejoId: number, token: string): Promise<Reserva[]> {
    // 1. Obtener canchas del complejo
    const canchasResponse = await this.fastApiClient.get('/api/v1/canchas', {
      params: { complejo_id: complejoId },
      headers: { Authorization: `Bearer ${token}` }
    });
    const canchaIds = canchasResponse.data.map((c: any) => c.id_cancha);
    
    // 2. Obtener todas las reservas
    const reservasResponse = await this.fastApiClient.get('/api/v1/reservas', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 3. Filtrar por canchas del complejo
    return reservasResponse.data.filter((r: any) => 
      canchaIds.includes(r.id_cancha)
    );
  }

  // ... más métodos
}
```

#### Opción 2: Conectar frontend directamente a FastAPI (TEMPORAL)

Crear un servicio separado para reservas que apunte a FastAPI:

```typescript
// sporthub-temuco/src/config/fastapi.ts
export const apiFastAPI = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// sporthub-temuco/src/services/reservaService.ts
import { apiFastAPI } from '@/config/fastapi';

export const getReservas = async () => {
  const token = localStorage.getItem('token');
  const response = await apiFastAPI.get('/reservas', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

⚠️ **PROBLEMA:** Esto rompe la arquitectura BFF y expone FastAPI directamente al frontend.

---

## PROBLEMA 2: Extracción Incorrecta del User ID del JWT

### 🐛 Error Detectado

**Archivo:** `backend/src/admin/presentation/controllers/admin.controller.ts`  
**Línea:** ~35  
**Método:** `getOwnerId()`

```typescript
// ❌ CÓDIGO ACTUAL (INCORRECTO)
private getOwnerId(req: Request): number {
  const ownerId = (req as any)?.user?.id || Number(req.headers["x-user-id"]);
  if (!ownerId) throw new Error("Owner ID no encontrado en el token");
  return ownerId;
}
```

### ❓ ¿Por qué falla?

El `authMiddleware` decodifica el JWT y coloca el payload completo en `req.user`. El payload del JWT de FastAPI tiene esta estructura:

```json
{
  "sub": "34",      // ← ID del usuario (estándar JWT)
  "role": "admin",
  "exp": 1761334535
}
```

**El problema:** El controlador busca `req.user.id`, pero el JWT usa el campo estándar `sub` (subject) para el ID del usuario.

### ✅ Solución Requerida

Cambiar el método `getOwnerId()` para buscar en el campo correcto:

```typescript
// ✅ CÓDIGO CORREGIDO
private getOwnerId(req: Request): number {
  // El JWT de FastAPI usa 'sub' para el user ID (estándar JWT)
  const userId = (req as any)?.user?.sub || (req as any)?.user?.id;
  const ownerId = userId ? Number(userId) : Number(req.headers["x-user-id"]);
  
  if (!ownerId || isNaN(ownerId)) {
    console.error('❌ [AdminController] Owner ID no encontrado:', {
      userSub: (req as any)?.user?.sub,
      userId: (req as any)?.user?.id,
      headerUserId: req.headers["x-user-id"],
      userObject: (req as any)?.user
    });
    throw new Error("Owner ID no encontrado en el token");
  }
  
  console.log('✅ [AdminController] Owner ID extraído:', ownerId);
  return ownerId;
}
```

---

## Endpoints Afectados

Todos los endpoints de admin están afectados porque dependen del método `getOwnerId()`:

### 🔴 Endpoints que NO funcionan actualmente:

1. **GET** `/api/admin/canchas` - Listar canchas del admin
2. **POST** `/api/admin/canchas` - Crear nueva cancha
3. **GET** `/api/admin/canchas/:id` - Obtener cancha específica
4. **PUT** `/api/admin/canchas/:id` - Actualizar cancha
5. **DELETE** `/api/admin/canchas/:id` - Eliminar cancha
### 🔴 Endpoints que NO funcionan actualmente:

**Reservas (NO EXISTEN):**
1. **GET** `/api/reservas` - Listar todas las reservas → **404 Not Found**
2. **GET** `/api/admin/reservas` - Listar reservas filtradas por complejo del admin → **404 Not Found** ⚠️ **CRÍTICO: Este es el que el frontend necesita**
3. **POST** `/api/reservas` - Crear nueva reserva → **404 Not Found**
4. **GET** `/api/reservas/:id` - Obtener reserva específica → **404 Not Found**
5. **PUT** `/api/reservas/:id` - Actualizar reserva → **404 Not Found**
6. **DELETE** `/api/reservas/:id` - Eliminar reserva → **404 Not Found**

**Canchas (EXISTEN pero FALLAN por JWT):**
7. **GET** `/api/admin/canchas` - Listar canchas del admin → **500 Internal Server Error** (req.user.id undefined)
8. **POST** `/api/admin/canchas` - Crear nueva cancha → **500 Internal Server Error**
9. **GET** `/api/admin/canchas/:id` - Obtener cancha específica → **500 Internal Server Error**
10. **PUT** `/api/admin/canchas/:id` - Actualizar cancha → **500 Internal Server Error**
11. **DELETE** `/api/admin/canchas/:id` - Eliminar cancha → **500 Internal Server Error**

**Complejos (NO VERIFICADOS, probablemente fallan por JWT):**
12. **GET** `/api/admin/complejos` - Listar complejos del admin
13. **POST** `/api/admin/complejos` - Crear nuevo complejo
14. **PUT** `/api/admin/complejos/:id` - Actualizar complejo
15. **DELETE** `/api/admin/complejos/:id` - Eliminar complejo

### ⚠️ Impacto del Filtrado Faltante:

**Sin el endpoint `/api/admin/reservas` con filtro:**
- ❌ Admin del Complejo A puede ver reservas del Complejo B (si existiera el endpoint general)
- ❌ No hay aislamiento de datos entre complejos
- ❌ Violación de privacidad y seguridad
- ❌ Panel de admin muestra datos incorrectos

**Ejemplo del problema:**

```
Usuario: dueno.cancha@gmail.com (ID: 34)
Complejo: Complejo Deportivo Temuco (ID: 4)

SIN FILTRO (endpoint general /reservas):
- Muestra reservas de TODOS los complejos ❌
- Reserva #1: Cancha del Complejo 1 ❌
- Reserva #2: Cancha del Complejo 2 ❌
- Reserva #3: Cancha del Complejo 4 ✅ (la única que debería ver)

CON FILTRO (endpoint /admin/reservas):
- Muestra SOLO reservas de canchas del Complejo 4 ✅
- Reserva #3: Cancha del Complejo 4 ✅
```

**Por eso el frontend REQUIERE el endpoint con filtro.**

---

## Pruebas Realizadas

### ✅ Token JWT Válido Verificado

**Token usado en pruebas:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNCIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc2MTMzNDUzNX0.OgdWfrOLPArdmhvDMvtQZg2mdKyKC_Utsz1UasA9Oms
```

**Payload decodificado:**
```json
{
  "sub": "34",
  "role": "admin",
  "exp": 1761334535
}
```

**Usuario:** dueno.cancha@gmail.com (ID: 34)

### ✅ Endpoints de FastAPI funcionan correctamente

Probamos directamente contra FastAPI y **SÍ funciona**:

```bash
GET http://api-h1d7oi-a881cc-168-232-167-73.traefik.me/api/v1/canchas?duenio_id=34
Authorization: Bearer <token>
```

**Respuesta:** 200 OK - Devuelve 13 canchas correctamente

### ❌ Endpoints del BFF fallan

```bash
GET http://localhost:4000/api/admin/canchas
Authorization: Bearer <token>
```

**Respuesta:** 500 Internal Server Error  
**Error:** "Owner ID no encontrado en el token"

---

## Logs del Backend

El authMiddleware **SÍ decodifica correctamente** el token:

```
✅ [authMiddleware] Token presente: {
  sub: '34',
  role: 'admin',
  rol: undefined,
  exp: 1761334535,
  expDate: '2025-10-24T19:35:35.000Z'
}
🔄 [authMiddleware] Normalizando role → rol: admin → admin
```

Pero el AdminController **NO encuentra** el Owner ID porque busca en el campo incorrecto.

---

## Impacto en el Frontend

### Páginas Afectadas

- ❌ `/admin/canchas` - Gestión de Canchas
- ❌ `/admin/reservas` - Gestión de Reservas  
- ❌ `/admin/complejos` - Gestión de Complejos

### Funcionalidades Bloqueadas

- No se pueden listar canchas del administrador
- No se pueden crear nuevas canchas
- No se pueden editar canchas existentes
- No se pueden eliminar canchas
- No se pueden listar reservas del administrador
- No se pueden gestionar complejos

---

## Solución Temporal Aplicada en Frontend

Por el momento, el frontend está intentando usar los endpoints de admin, pero fallan. 

**Alternativa temporal (no recomendada):** Podríamos usar los endpoints generales `/api/canchas` que SÍ funcionan, pero estos **NO filtran por dueño**, mostrando todas las canchas del sistema.

---

## Archivos que Necesitan Corrección en Backend

1. **`backend/src/admin/presentation/controllers/admin.controller.ts`**
   - Método `getOwnerId()` - Línea ~35
   - Cambiar `req.user.id` a `req.user.sub`

2. **Verificar también:**
   - `backend/src/admin/presentation/guards/guards.ts` (si usa req.user.id)
   - Cualquier otro controlador que extraiga el user ID del JWT

---

## Recomendaciones

### 1. Estandarizar Extracción de User ID

Crear un helper centralizado para extraer el user ID del JWT:

```typescript
// backend/src/utils/jwtHelpers.ts
export function getUserIdFromRequest(req: Request): number {
  const userId = (req as any)?.user?.sub || (req as any)?.user?.id;
  if (!userId) throw new Error("User ID no encontrado en el token");
  return Number(userId);
}
```

### 2. Agregar Logging Detallado

Agregar logs para debugging cuando falle la extracción del ID:

```typescript
if (!ownerId) {
  console.error('❌ Owner ID no encontrado:', {
    userObject: (req as any)?.user,
    headers: req.headers
  });
  throw new Error("Owner ID no encontrado en el token");
}
```

### 3. Validar Otros Controladores

Revisar si hay otros controladores que también extraen user ID de `req.user.id` en lugar de `req.user.sub`.

---

## Pruebas Sugeridas Post-Fix

Después de aplicar las correcciones, probar:

### Para Problema 1 (Endpoints de Reservas):

1. ✅ GET `/api/reservas` - Debe devolver todas las reservas
2. ✅ GET `/api/admin/reservas` - Debe devolver reservas filtradas por complejo del admin
3. ✅ POST `/api/reservas` - Debe crear nueva reserva
4. ✅ GET `/api/reservas/:id` - Debe devolver detalle de reserva
5. ✅ PUT `/api/reservas/:id` - Debe actualizar reserva
6. ✅ DELETE `/api/reservas/:id` - Debe eliminar reserva

### Para Problema 2 (JWT en endpoints de canchas):

1. ✅ Login como admin (dueno.cancha@gmail.com)
2. ✅ GET `/api/admin/canchas` - Debe devolver solo canchas del complejo del admin
3. ✅ POST `/api/admin/canchas` - Debe crear cancha asociada al complejo del admin
4. ✅ PUT `/api/admin/canchas/:id` - Debe actualizar solo si la cancha pertenece al admin
5. ✅ DELETE `/api/admin/canchas/:id` - Debe eliminar solo si la cancha pertenece al admin

---

## Estado Actual y Medidas Temporales

### ⚠️ Workarounds Aplicados en Frontend

Debido a que estos bugs bloquean completamente el desarrollo, se aplicaron las siguientes **soluciones temporales** en el frontend:

#### 1. Gestión de Canchas - Usando endpoints generales (SIN FILTRO)

**Archivos modificados:**
- `sporthub-temuco/src/app/admin/canchas/page.tsx`
- `sporthub-temuco/src/app/admin/canchas/crear/page.tsx`
- `sporthub-temuco/src/app/admin/canchas/[id]/page.tsx`

**Cambios:**
```typescript
// TEMPORAL: Usando endpoints generales en lugar de /admin/canchas
// ❌ ANTES: GET /api/admin/canchas (con filtro por complejo)
// ✅ AHORA: GET /api/canchas (muestra TODAS las canchas)

// TODO: Revertir a /admin/canchas cuando se fixee req.user.sub en backend
```

**Consecuencias:**
- ⚠️ Muestra TODAS las canchas de TODOS los complejos
- ⚠️ Admin del Complejo A puede ver (y editar!) canchas del Complejo B
- ⚠️ No valida permisos de edición/eliminación
- ⚠️ Violación de seguridad y privacidad

#### 2. Gestión de Reservas - BLOQUEADO COMPLETAMENTE ❌

**Estado:** ❌ **NO FUNCIONA - PANEL INUTILIZABLE**

**Archivos afectados:**
- `sporthub-temuco/src/app/admin/reservas/page.tsx`
- `sporthub-temuco/src/services/reservaService.ts`

**Intentos de workaround:**

```typescript
// Intento 1: Usar endpoint de admin con filtro
// ❌ RESULTADO: 404 Not Found
async getAdminReservas() {
  const { data } = await apiBackend.get('/admin/reservas'); // No existe en BFF
  return data;
}

// Intento 2: Fallback a endpoint general
// ❌ RESULTADO: 404 Not Found  
async getAdminReservas() {
  const { data } = await apiBackend.get('/reservas'); // Tampoco existe en BFF
  return data;
}

// Intento 3: ¿Conectar directo a FastAPI?
// ❌ NO APLICADO: Rompería la arquitectura BFF
const { data } = await axios.get('http://localhost:8000/api/v1/reservas'); 
```

**Error actual en consola:**
```
GET http://localhost:4000/api/reservas 404 (Not Found)
📥 Respuesta completa del servidor: {ok: false, error: {...}}
Formato inesperado de respuesta: {ok: false, error: {...}}
📊 Total de reservas procesadas: 0
```

**Impacto:**
- ❌ No se pueden listar reservas en el panel de admin
- ❌ No se pueden crear reservas desde el admin
- ❌ No se pueden editar/cancelar reservas  
- ❌ Panel de "Gestión de Reservas" completamente inutilizable
- ❌ **BLOQUEANTE TOTAL para testing del módulo de reservas**

#### 3. Por qué NO podemos usar un workaround para reservas:

**Opción rechazada: Endpoint general `/reservas` sin filtro**

```typescript
// ❌ NO PODEMOS HACER ESTO aunque existiera el endpoint:
async getAdminReservas() {
  // Esto mostraría reservas de TODOS los complejos
  const { data } = await apiBackend.get('/reservas');
  
  // Problema de seguridad: Admin ve reservas privadas de otros complejos
  // Ejemplo:
  // - Reserva de Juan en Complejo A (privado) ❌
  // - Reserva de María en Complejo B (privado) ❌  
  // - Reserva de Pedro en Complejo C (privado) ❌
  
  return data; // ← VIOLACIÓN DE PRIVACIDAD
}
```

**¿Por qué el filtro es OBLIGATORIO?**

1. **Privacidad:** Cada admin solo debe ver reservas de SU complejo
2. **Seguridad:** Admin no debe poder modificar reservas de otros complejos
3. **RGPD/LOPD:** Datos personales de usuarios no deben filtrarse entre complejos
4. **Lógica de negocio:** Admin gestiona solo SUS canchas y SUS reservas

**Con canchas pudimos hacer workaround porque:**
- Las canchas son semi-públicas (aparecen en búsquedas)
- El impacto de seguridad es MENOR (aunque sigue siendo incorrecto)
- Era un workaround temporal para continuar desarrollo

**Con reservas NO podemos porque:**
- Las reservas contienen datos personales sensibles
- Mostrar todas las reservas es una violación crítica de privacidad
- No hay forma de filtrar del lado del cliente (no tenemos info del complejo)
- **El endpoint CON FILTRO es absolutamente necesario**

### 📋 Checklist de Archivos con TODOs para Revertir

Una vez que el backend se fixee, hay que revertir estos cambios:

```bash
# Archivos con comentarios TODO para revertir:
sporthub-temuco/src/app/admin/canchas/page.tsx           # Línea ~45: Revertir a /admin/canchas
sporthub-temuco/src/app/admin/canchas/crear/page.tsx     # Línea ~35: Revertir a /admin/canchas
sporthub-temuco/src/app/admin/canchas/[id]/page.tsx      # Línea ~40: Revertir a /admin/canchas/:id
sporthub-temuco/src/services/reservaService.ts           # Línea ~170: Revertir a /admin/reservas
```

**Comando para buscar TODOs:**
```bash
grep -r "TODO.*admin.*backend" sporthub-temuco/src/
```

### 🔄 Plan de Reversión Post-Fix

Cuando el backend esté corregido:

1. Verificar que `/api/admin/canchas` devuelve solo canchas del admin
2. Verificar que `/api/reservas` existe y funciona
3. Buscar todos los archivos con `TODO.*backend`
4. Revertir los endpoints de `/canchas` a `/admin/canchas`
5. Revertir los endpoints de `/reservas` a `/admin/reservas`
6. Probar que el filtrado por admin funciona correctamente
7. Eliminar todos los comentarios TODO

---

## Priorización de Correcciones

### ~~🔴 URGENTE (Bloqueante Total)~~ → ✅ **RESUELTO**

**~~PROBLEMA 1: Implementar endpoints de reservas en BFF~~**
- ✅ **COMPLETADO** - Los endpoints ya existen y funcionan
- Estado: Confirmado funcionando en localhost:4000
- Frontend recibe 200 OK de `/api/reservas`
- ⚠️ **NUEVA OBSERVACIÓN:** Lista retorna 0 resultados (puede ser normal si no hay datos en DB)

### 🔵 INVESTIGACIÓN REQUERIDA:

**LISTADO DE RESERVAS VACÍO:**
- Endpoint responde correctamente (200 OK)
- No se observan errores en logs del backend
- Frontend procesa respuesta como "0 reservas"
- **Causas posibles:**
  1. No hay reservas en la base de datos FastAPI (normal si recién iniciamos)
  2. BFF no está conectándose correctamente a FastAPI
  3. FastAPI no retorna datos por algún filtro o error
- **Acción requerida:** 
  - Verificar si existen reservas en FastAPI `/api/v1/reservas`
  - Si no hay datos: crear reservas de prueba desde el panel
  - Si hay datos: verificar logs de FastAPI para errores

### 🟠 ALTA (Workaround Aplicado):

**PROBLEMA 2: Corregir extracción de user ID del JWT**
- Actualmente funciona con endpoints generales (sin filtrado)
- Estimación: 15-30 minutos de desarrollo  
- Impacto: Habilita filtrado por admin en canchas

### 🟡 MEDIA (Configuración):

**Configurar variable de entorno en frontend:**
- Agregar `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000` al `.env`
- Impacto: Frontend usará backend local en lugar de producción
- Tiempo: 2 minutos

### ⏱️ Tiempo Total Estimado:
- ~~Problema 1: 4-6 horas~~ → ✅ Ya implementado
- Problema 2: 15-30 minutos
- Configuración: 2 minutos
- Testing: 30 minutos
- **TOTAL: ~1 hora** (antes: 6-9 horas)

---

## Contacto

**Equipo:** Frontend  
**Para consultas:** Revisar este documento o contactar al equipo de frontend

**Nota:** El frontend está listo para usar los endpoints correctos una vez que se corrijan estos bugs en el backend.

**Última actualización:** 24 de octubre de 2025 - 19:40
- ✅ Confirmado que endpoints de reservas existen y funcionan
- ⚠️ Lista de reservas retorna 0 resultados (requiere investigación)
- ⚠️ Posible causa: No hay datos en la base de datos (crear reservas de prueba)
