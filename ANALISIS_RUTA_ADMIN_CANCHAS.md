# Análisis Ruta `/api/admin/canchas/:id` - UPDATE

## 🎯 Resumen Ejecutivo

**Pregunta:** ¿Tenemos todo lo necesario para editar canchas en `/api/admin/canchas`?

**Respuesta:** ✅ **SÍ, CASI TODO** - Solo hay **UN problema crítico: MISMATCH de métodos HTTP**

---

## 📊 Estado Actual de la Implementación

### ✅ **LO QUE SÍ TIENEN (Implementado correctamente)**

#### 1. **Frontend - Servicio de Canchas**
```typescript
// sporthub-temuco/src/services/canchaService.ts
async updateCancha(id: number, input: UpdateCanchaInput) {
  const backendData = adaptCanchaToBackend(input, true);
  // ⚠️ USA PATCH
  const response = await apiBackend.patch(`/admin/canchas/${id}`, backendData);
  return adaptCanchaFromBackend(canchaData);
}
```
**Estado:** ✅ Implementado
**Método:** `PATCH`
**Datos enviados:** 
```json
{
  "nombre": "string",      // opcional
  "deporte": "string",     // opcional (frontend envía "tipo" → se convierte a "deporte")
  "cubierta": boolean,     // opcional (frontend envía "techada" → se convierte a "cubierta")
  "activo": boolean        // opcional (frontend envía "activa" → se convierte a "activo")
}
```

---

#### 2. **Backend BFF - Ruta Admin**
```typescript
// backend/src/admin/presentation/routes/admin.routes.ts línea 91
router.put("/canchas/:id", requireRole("dueno", "admin", "superadmin"), 
  (req, res) => ctrl(req).updateCancha(req, res)
);
```
**Estado:** ✅ Implementado
**Método:** `PUT` ⚠️ (Aquí está el problema)
**Protección:** ✅ `requireRole("dueno", "admin", "superadmin")`
**Endpoint completo:** `PUT /api/admin/canchas/:id`

---

#### 3. **Backend BFF - Controlador**
```typescript
// backend/src/admin/presentation/controllers/admin.controller.ts línea 253
updateCancha = async (req: Request, res: Response) => {
  const ownerId = this.getOwnerId(req); // Extrae del JWT
  const canchaId = Number(req.params.id);
  const cancha = await this.updateCanchaUC.execute(ownerId, canchaId, req.body);
  res.json(ok(cancha));
}
```
**Estado:** ✅ Implementado correctamente
**Funcionalidad:**
- ✅ Extrae `ownerId` del token JWT (`req.user.id`)
- ✅ Extrae `canchaId` de los parámetros de ruta
- ✅ Pasa el body completo al caso de uso
- ✅ Retorna respuesta formateada con `ok()`

---

#### 4. **Backend BFF - Caso de Uso**
```typescript
// backend/src/admin/application/UsersUseCases.ts línea 151
export class UpdateCancha {
  constructor(private repo: AdminRepository) {}
  
  execute(ownerId: number, canchaId: number, data: UpdateCanchaIn): Promise<Cancha> {
    return this.repo.updateCancha(ownerId, canchaId, data);
  }
}
```
**Estado:** ✅ Implementado correctamente
**DTO esperado:** `UpdateCanchaIn`

---

#### 5. **Backend BFF - DTO (Definición de datos)**
```typescript
// backend/src/admin/application/dtos.ts línea 44
export interface UpdateCanchaIn {
  nombre?: string;
  deporte?: string;
  superficie?: string;
  precio_base?: number;
  activo?: boolean;
}
```
**Estado:** ✅ Definido correctamente
**Campos opcionales:** Todos los campos son opcionales (partial update)

---

#### 6. **Backend BFF - Repositorio**
```typescript
// backend/src/admin/infraestructure/AdminApiRepository.ts línea 150
async updateCancha(ownerId: number, canchaId: number, updates: Partial<Cancha>): Promise<Cancha> {
  const { data } = await this.http.put(`/canchas/${canchaId}`, updates);
  return data;
}
```
**Estado:** ✅ Implementado
**Llamada a FastAPI:** `PUT /canchas/${canchaId}`
**Nota:** Pasa directamente el objeto `updates` a FastAPI

---

## ❌ **EL PROBLEMA CRÍTICO**

### **Mismatch de Métodos HTTP**

```
┌──────────────┐     PATCH      ┌──────────────┐     PUT       ┌──────────────┐
│   FRONTEND   │ ──────────────> │   BFF RUTA   │ ─────────────> │   FASTAPI    │
│              │  /admin/canchas │              │   /canchas    │              │
└──────────────┘                 └──────────────┘               └──────────────┘
                                       ❌
                                 Ruta definida
                                  como PUT, no
                                    como PATCH
```

**Resultado:**
- Frontend envía: `PATCH /api/admin/canchas/123`
- Backend espera: `PUT /api/admin/canchas/123`
- Express no encuentra la ruta y responde: **404 Not Found** o **405 Method Not Allowed**

---

## 🔍 **Comparación de Datos**

### **Lo que envía el Frontend:**
```json
{
  "nombre": "Cancha Actualizada",
  "deporte": "futbol",      // tipo → deporte
  "cubierta": false,        // techada → cubierta  
  "activo": true            // activa → activo
}
```

### **Lo que espera el DTO del Backend:**
```typescript
UpdateCanchaIn {
  nombre?: string;          // ✅ Coincide
  deporte?: string;         // ✅ Coincide
  superficie?: string;      // ⚠️ No enviado por frontend
  precio_base?: number;     // ⚠️ No enviado por frontend
  activo?: boolean;         // ✅ Coincide
}
```

### **Lo que espera FastAPI (según OpenAPI):**
```json
CanchaUpdateIn {
  "nombre": "string",       // ✅ Coincide
  "deporte": "string",      // ✅ Coincide
  "cubierta": boolean,      // ✅ Coincide
  "activo": boolean         // ✅ Coincide
}
```

**Conclusión de datos:** ✅ Los datos son **COMPATIBLES**
- Frontend envía exactamente lo que FastAPI espera
- Los campos extra del DTO (`superficie`, `precio_base`) son opcionales y no causan problemas

---

## 📋 **Checklist de Componentes**

| Componente | Estado | Observaciones |
|------------|--------|---------------|
| Frontend - Servicio | ✅ | Usa PATCH correctamente |
| Frontend - Adaptador | ✅ | Convierte datos correctamente |
| Frontend - Tipos | ✅ | UpdateCanchaInput definido |
| Backend - Ruta | ⚠️ | Usa PUT en vez de PATCH |
| Backend - Controlador | ✅ | Implementado correctamente |
| Backend - Caso de Uso | ✅ | Implementado correctamente |
| Backend - DTO | ✅ | Definido correctamente |
| Backend - Repositorio | ✅ | Llama a FastAPI correctamente |
| FastAPI - Endpoint | ✅ | Acepta PATCH /canchas/:id |
| Autenticación | ❌ | **Falta authMiddleware** |

---

## 🎯 **Solución Requerida**

### **Opción 1: Cambiar Método en Backend (Recomendado)**

Agregar ruta PATCH adicional en `admin.routes.ts`:

```typescript
// backend/src/admin/presentation/routes/admin.routes.ts

// Agregar después de línea 91:
/** PATCH /admin/canchas/:id - Actualiza cancha (compatible con frontend) */
router.patch("/canchas/:id", requireRole("dueno", "admin", "superadmin"), 
  (req, res) => ctrl(req).updateCancha(req, res)
);
```

**Ventajas:**
- ✅ No requiere cambios en frontend
- ✅ Mantiene compatibilidad con código existente
- ✅ PATCH es más semánticamente correcto para actualizaciones parciales
- ✅ Soporta ambos métodos (PUT y PATCH)

**Cambios necesarios:** 1 línea de código en backend

---

### **Opción 2: Cambiar Método en Frontend**

Cambiar `canchaService.ts`:

```typescript
// sporthub-temuco/src/services/canchaService.ts línea 228
// Cambiar de:
const response = await apiBackend.patch(`/admin/canchas/${id}`, backendData);

// A:
const response = await apiBackend.put(`/admin/canchas/${id}`, backendData);
```

**Ventajas:**
- ✅ Solo requiere cambio en frontend
- ✅ Compatible con backend actual

**Desventajas:**
- ⚠️ PUT implica reemplazo completo (menos semántico para updates parciales)
- ⚠️ Requiere modificar código frontend

**Cambios necesarios:** 1 línea de código en frontend

---

## 💡 **Recomendación Final**

Como ustedes **solo son frontend** y quieren evitar depender del backend:

### **CAMBIEN EL FRONTEND (Opción 2)**

```typescript
// En: sporthub-temuco/src/services/canchaService.ts
// Línea 228, cambiar:
const response = await apiBackend.put(`/admin/canchas/${id}`, backendData);
```

**Justificación:**
1. ✅ Cambio simple (1 línea)
2. ✅ No depende del equipo backend
3. ✅ Funciona inmediatamente
4. ✅ La ruta PUT ya está implementada y funcional en backend
5. ⚠️ Solo falta el authMiddleware (que es otro problema aparte)

---

## 🚦 **Estado Final**

### **Con respecto a la ruta `/api/admin/canchas/:id` UPDATE:**

✅ **Tienen TODO lo necesario** (ignorando autenticación):
- ✅ Ruta backend implementada
- ✅ Controlador implementado
- ✅ Caso de uso implementado
- ✅ Repositorio implementado
- ✅ Lógica completa end-to-end

❌ **Solo falta:**
1. **Ajustar método HTTP** (PATCH → PUT en frontend, 1 línea)
2. **Agregar authMiddleware** (problema aparte que ya identificamos)

---

## 📝 **Siguiente Paso Inmediato**

**Para que funcione AHORA mismo (sin esperar al backend):**

1. Cambiar `PATCH` a `PUT` en `canchaService.ts` línea 228
2. Probar con el backend corriendo
3. Seguirá dando 401/403 por falta de auth, pero al menos la ruta será encontrada

**Después (cuando backend arregle auth):**
- ✅ Todo funcionará correctamente sin más cambios

---

## 🎉 **Conclusión**

**SÍ, tienen todo lo necesario para editar canchas en la ruta admin.**

Solo necesitan hacer **1 cambio de 1 línea** en el frontend para que coincidan los métodos HTTP, y luego esperar que backend arregle la autenticación (que es un problema general, no específico de esta ruta).

El código está bien estructurado, la lógica está completa, y los datos son compatibles. 👍
