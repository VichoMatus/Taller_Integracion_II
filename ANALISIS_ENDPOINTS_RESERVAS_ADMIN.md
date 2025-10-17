# Análisis: Endpoints de Gestión de Reservas (Admin)

## 🎯 Resumen Ejecutivo

**Pregunta:** ¿Existen los endpoints para gestionar reservas en la sección Admin?

**Respuesta:** ✅ **SÍ, pero con LIMITACIONES**

---

## 📊 Estado Actual de los Endpoints

### ✅ **BACKEND - Ruta Admin**

#### **Endpoint Disponible:**
```typescript
// backend/src/admin/presentation/routes/admin.routes.ts línea 99
router.get("/reservas", requireRole("dueno", "admin", "superadmin"), 
  (req, res) => ctrl(req).getMisReservas(req, res)
);
```

**Ruta completa:** `GET /api/admin/reservas`

**Protección:** ✅ `requireRole("dueno", "admin", "superadmin")`

**Funcionalidad:**
```typescript
// Controlador línea 86-98
getMisReservas = async (req: Request, res: Response) => {
  const ownerId = this.getOwnerId(req); // Extrae del JWT
  const filtros = {
    fecha_desde: req.query.fecha_desde as string,
    fecha_hasta: req.query.fecha_hasta as string,
    estado: req.query.estado as string
  };
  const reservas = await this.getMisReservasUC.execute(ownerId, filtros);
  res.json(ok(reservas));
}
```

**Implementación del repositorio:**
```typescript
// AdminApiRepository línea 47-56
async getMisReservas(ownerId: number, params = {}): Promise<ReservaOwner[]> {
  // Llama a FastAPI con filtro de dueño
  const { data } = await this.http.get(`/reservas`, { 
    params: { duenio_id: ownerId, ...params } 
  });
  return data.items || data || [];
}
```

---

## ❌ **ENDPOINTS QUE FALTAN EN /api/admin/reservas**

### **Solo existe GET (listar), NO existen:**

| Operación | Ruta Esperada | Estado | Observación |
|-----------|---------------|--------|-------------|
| **Listar** | `GET /api/admin/reservas` | ✅ Existe | Con filtros (fecha, estado) |
| **Obtener una** | `GET /api/admin/reservas/:id` | ❌ **NO existe** | Solo está en `/api/reservas/:id` |
| **Crear** | `POST /api/admin/reservas` | ❌ **NO existe** | Solo está en `/api/reservas` |
| **Editar** | `PATCH /api/admin/reservas/:id` | ❌ **NO existe** | Solo está en `/api/reservas/:id` |
| **Eliminar** | `DELETE /api/admin/reservas/:id` | ❌ **NO existe** | Solo está en `/api/reservas/:id` |
| **Confirmar** | `POST /api/admin/reservas/:id/confirmar` | ❌ **NO existe** | Solo está en `/api/reservas/:id/confirmar` |
| **Cancelar** | `POST /api/admin/reservas/:id/cancelar` | ❌ **NO existe** | Solo está en `/api/reservas/:id/cancelar` |
| **Check-in** | `POST /api/admin/reservas/:id/check-in` | ❌ **NO existe** | Solo está en `/api/reservas/:id/check-in` |
| **No-show** | `POST /api/admin/reservas/:id/no-show` | ❌ **NO existe** | Solo está en `/api/reservas/:id/no-show` |

---

## 🔍 **ALTERNATIVA: Rutas en /api/reservas**

El backend tiene **rutas completas** en el módulo de reservas público:

```typescript
// backend/src/reservas/presentation/routes/reservas.routes.new.ts

// === RUTAS AUTENTICADAS (con authMiddleware) ===
router.post("/cotizar", ...)                      // Línea 132
router.get("/mias", authMiddleware, ...)          // Línea 137
router.post("/", authMiddleware, ...)             // Línea 140 - CREATE
router.get("/:id", authMiddleware, ...)           // Línea 143 - GET ONE
router.patch("/:id", authMiddleware, ...)         // Línea 146 - UPDATE
router.post("/:id/cancelar", authMiddleware, ...) // Línea 149
router.post("/:id/confirmar", authMiddleware, ...) // Línea 152
router.post("/:id/check-in", authMiddleware, ...) // Línea 155
router.post("/:id/no-show", authMiddleware, ...)  // Línea 158

// === RUTA ADMIN (con requireRole) ===
router.get("/", requireRole("admin", "superadmin"), ...) // Línea 164 - LIST ALL
```

**Rutas completas:**
- `GET /api/reservas/mias` - Reservas del usuario autenticado ✅
- `POST /api/reservas` - Crear reserva ✅
- `GET /api/reservas/:id` - Obtener reserva ✅
- `PATCH /api/reservas/:id` - Actualizar reserva ✅
- `POST /api/reservas/:id/cancelar` - Cancelar ✅
- `POST /api/reservas/:id/confirmar` - Confirmar ✅
- `POST /api/reservas/:id/check-in` - Check-in ✅
- `POST /api/reservas/:id/no-show` - No-show ✅
- `GET /api/reservas` - Listar todas (admin/superadmin) ✅

---

## 📱 **FRONTEND - Servicio de Reservas**

### **Lo que usa actualmente:**

```typescript
// sporthub-temuco/src/services/reservaService.ts

export const reservaService = {
  // Usa /api/reservas (NO /api/admin/reservas)
  async getReservas(filters?: ReservaFilters): Promise<Reserva[]> {
    const { data } = await apiBackend.get('/api/reservas', { params: filters });
    return data;
  },

  async getReservaById(id: number): Promise<Reserva> {
    const { data } = await apiBackend.get(`/api/reservas/${id}`);
    return data;
  },

  async createReserva(input: CreateReservaInput): Promise<Reserva> {
    const { data } = await apiBackend.post('/api/reservas', input);
    return data;
  },

  async updateReserva(id: number, input: UpdateReservaInput): Promise<Reserva> {
    const { data } = await apiBackend.patch(`/api/reservas/${id}`, input);
    return data;
  },

  async deleteReserva(id: number): Promise<void> {
    await apiBackend.delete(`/api/reservas/${id}`);
  },

  async getMisReservas(): Promise<Reserva[]> {
    const { data } = await apiBackend.get('/api/reservas/mias');
    return data;
  },

  // Operaciones especiales:
  async confirmarReserva(id: number): Promise<ConfirmarReservaResponse> {
    const { data } = await apiBackend.post(`/api/reservas/${id}/confirmar`);
    return data;
  },

  async checkInReserva(id: number): Promise<CheckInResponse> {
    const { data } = await apiBackend.post(`/api/reservas/${id}/check-in`);
    return data;
  },

  async noShowReserva(id: number): Promise<NoShowResponse> {
    const { data } = await apiBackend.post(`/api/reservas/${id}/no-show`);
    return data;
  },

  async cancelarReserva(id: number): Promise<Reserva> {
    const { data } = await apiBackend.post(`/api/reservas/${id}/cancelar`);
    return data;
  }
};
```

---

## 🔄 **COMPARACIÓN: Frontend vs Backend Admin**

### **Frontend (reservaService.ts)**
| Operación | Ruta Frontend | Método |
|-----------|---------------|--------|
| Listar | `/api/reservas` | GET |
| Obtener una | `/api/reservas/:id` | GET |
| Crear | `/api/reservas` | POST |
| Editar | `/api/reservas/:id` | PATCH |
| Eliminar | `/api/reservas/:id` | DELETE |
| Mis reservas | `/api/reservas/mias` | GET |
| Confirmar | `/api/reservas/:id/confirmar` | POST |
| Check-in | `/api/reservas/:id/check-in` | POST |
| No-show | `/api/reservas/:id/no-show` | POST |
| Cancelar | `/api/reservas/:id/cancelar` | POST |

### **Backend Admin (admin.routes.ts)**
| Operación | Ruta Backend Admin | Método |
|-----------|-------------------|--------|
| Listar MIS reservas | `/api/admin/reservas` | GET ✅ |
| Obtener una | ❌ NO EXISTE | - |
| Crear | ❌ NO EXISTE | - |
| Editar | ❌ NO EXISTE | - |
| Eliminar | ❌ NO EXISTE | - |
| Confirmar | ❌ NO EXISTE | - |
| Check-in | ❌ NO EXISTE | - |
| No-show | ❌ NO EXISTE | - |
| Cancelar | ❌ NO EXISTE | - |

---

## ⚠️ **PROBLEMA IDENTIFICADO**

### **El frontend NO usa la ruta admin para reservas:**

```
❌ Frontend llama:  GET /api/reservas
✅ Backend tiene:   GET /api/admin/reservas
```

**Resultado:**
- El frontend usa rutas genéricas `/api/reservas/*`
- El backend admin solo tiene `GET /api/admin/reservas` para listar
- Para las demás operaciones, el frontend depende de `/api/reservas/*` que tienen `authMiddleware` (no `requireRole`)

---

## 🎯 **ESCENARIOS POSIBLES**

### **Escenario 1: ¿Pueden los dueños usar /api/reservas?**

**SI las rutas `/api/reservas/*` permiten a usuarios con rol "dueno":**
- ✅ El código actual funcionará
- ✅ Los dueños pueden gestionar reservas
- ⚠️ Pero están usando rutas "públicas" en vez de admin

**SI las rutas `/api/reservas/*` SOLO permiten al usuario que creó la reserva:**
- ❌ Los dueños NO podrán editar/eliminar reservas de sus clientes
- ❌ Necesitarían rutas específicas en `/api/admin/reservas`

---

### **Escenario 2: ¿Qué filtrado hace /api/admin/reservas?**

```typescript
// AdminApiRepository línea 49-53
async getMisReservas(ownerId: number, params = {}) {
  const { data } = await this.http.get(`/reservas`, { 
    params: { duenio_id: ownerId, ...params }  // ← Filtra por dueño
  });
}
```

**La ruta `/api/admin/reservas` llama a `/reservas` con filtro `duenio_id`**

**Preguntas:**
1. ¿El endpoint `/reservas` de FastAPI acepta filtro `duenio_id`?
2. ¿Devuelve solo las reservas de los complejos del dueño?

---

## 📋 **CHECKLIST DE ENDPOINTS**

### **Para ADMIN - Gestión de Reservas:**

| Funcionalidad | ¿Existe en Admin? | ¿Frontend lo usa? | Estado |
|---------------|-------------------|-------------------|--------|
| **Listar reservas del dueño** | ✅ GET /api/admin/reservas | ❌ Usa /api/reservas | ⚠️ Desalineado |
| **Ver detalle de reserva** | ❌ NO | ✅ Usa /api/reservas/:id | ⚠️ Falta endpoint admin |
| **Crear reserva** | ❌ NO | ✅ Usa /api/reservas | ⚠️ Falta endpoint admin |
| **Editar reserva** | ❌ NO | ✅ Usa /api/reservas/:id | ⚠️ Falta endpoint admin |
| **Eliminar reserva** | ❌ NO | ✅ Usa /api/reservas/:id | ⚠️ Falta endpoint admin |
| **Confirmar reserva** | ❌ NO | ✅ Usa /api/reservas/:id/confirmar | ⚠️ Falta endpoint admin |
| **Check-in** | ❌ NO | ✅ Usa /api/reservas/:id/check-in | ⚠️ Falta endpoint admin |
| **No-show** | ❌ NO | ✅ Usa /api/reservas/:id/no-show | ⚠️ Falta endpoint admin |
| **Cancelar** | ❌ NO | ✅ Usa /api/reservas/:id/cancelar | ⚠️ Falta endpoint admin |

---

## 🚨 **PROBLEMAS CRÍTICOS**

### **1. Frontend usa rutas incorrectas**
```typescript
// Frontend llama:
GET /api/reservas              // Debería ser /api/admin/reservas
GET /api/reservas/:id          // Debería ser /api/admin/reservas/:id
POST /api/reservas             // Debería ser /api/admin/reservas
PATCH /api/reservas/:id        // Debería ser /api/admin/reservas/:id
DELETE /api/reservas/:id       // Debería ser /api/admin/reservas/:id
```

### **2. Backend admin solo tiene GET (listar)**
- ❌ Faltan todas las demás operaciones CRUD en admin
- ❌ Faltan operaciones especiales (confirmar, check-in, etc.) en admin

### **3. Autenticación inconsistente**
- `/api/admin/*` usa `requireRole` (pero falta authMiddleware)
- `/api/reservas/*` usa `authMiddleware`
- Diferentes mecanismos de autenticación para mismo recurso

---

## 💡 **SOLUCIONES POSIBLES**

### **Opción A: Usar rutas públicas con authMiddleware**

**Cambiar frontend para verificar rol:**
- Seguir usando `/api/reservas/*`
- Confiar en que `authMiddleware` valide el token
- Asumir que el backend valida permisos del dueño

**Ventajas:**
- ✅ No requiere cambios en backend
- ✅ Las rutas ya existen y funcionan
- ✅ Menor trabajo

**Desventajas:**
- ⚠️ No usa rutas específicas de admin
- ⚠️ Mezcla rutas de usuario con rutas de admin

---

### **Opción B: Crear endpoints completos en /api/admin/reservas**

**Backend necesitaría agregar:**
```typescript
// En admin.routes.ts:
router.get("/reservas/:id", requireRole(...), ...)
router.post("/reservas", requireRole(...), ...)
router.patch("/reservas/:id", requireRole(...), ...)
router.delete("/reservas/:id", requireRole(...), ...)
router.post("/reservas/:id/confirmar", requireRole(...), ...)
router.post("/reservas/:id/check-in", requireRole(...), ...)
router.post("/reservas/:id/no-show", requireRole(...), ...)
router.post("/reservas/:id/cancelar", requireRole(...), ...)
```

**Frontend necesitaría actualizar:**
```typescript
// En reservaService.ts cambiar todas las rutas:
'/api/reservas' → '/api/admin/reservas'
```

**Ventajas:**
- ✅ Arquitectura más limpia
- ✅ Separación clara admin vs usuario
- ✅ Control de permisos explícito

**Desventajas:**
- ❌ Requiere muchos cambios en backend
- ❌ Duplicación de código
- ❌ Más trabajo

---

## 🎯 **RECOMENDACIÓN**

### **Para Frontend (ustedes):**

**Opción A - USAR RUTAS EXISTENTES:**
1. ✅ Mantener `reservaService.ts` como está usando `/api/reservas/*`
2. ✅ Confiar en que `authMiddleware` valida el token
3. ⏳ Esperar a probar si el backend permite a dueños gestionar reservas de sus complejos
4. ⚠️ Si no funciona, pedir al backend que agregue validación de permisos

**Ventajas:**
- No requiere cambios en frontend
- Las rutas ya están implementadas
- Menor riesgo de errores

---

## 📝 **CONCLUSIÓN FINAL**

### ✅ **SÍ existen endpoints para reservas, PERO:**

1. **En `/api/admin/reservas`:**
   - ✅ Solo GET (listar) está implementado
   - ❌ Faltan todas las demás operaciones

2. **En `/api/reservas`:**
   - ✅ CRUD completo implementado
   - ✅ Operaciones especiales implementadas
   - ⚠️ Usan `authMiddleware` (no `requireRole`)

3. **Frontend:**
   - ⚠️ Usa `/api/reservas/*` (rutas públicas)
   - ⚠️ NO usa `/api/admin/reservas`

---

### 🎯 **¿Qué hacer?**

**Por ahora:** Dejar el frontend como está y **PROBAR**

**Cuando puedan conectarse:**
1. Probar si `/api/reservas/*` permite a dueños gestionar reservas
2. Si funciona → ✅ No cambiar nada
3. Si no funciona → 💬 Pedir al backend que agregue endpoints en admin

---

**¿Quieres que revise algo más específico de las reservas o hacemos pruebas cuando se pueda conectar?** 🤔
