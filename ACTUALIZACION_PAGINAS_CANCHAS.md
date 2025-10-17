# Actualización Páginas de Canchas - Alineadas con FastAPI

## Resumen
Las páginas de administración de canchas han sido actualizadas para **alinearse exactamente** con los schemas de FastAPI consultados del OpenAPI.

---

## ❌ Problema Original

Las páginas estaban usando campos que **NO EXISTEN** en el schema de FastAPI:
- `precioPorHora` (precio_desde es READ-ONLY)
- `capacidad` (READ-ONLY)
- `descripcion` (READ-ONLY)
- `imagenUrl` (foto_principal es READ-ONLY)
- `estado` (FastAPI usa `activo: boolean`)

---

## ✅ Solución Implementada

### 1. **Tipos Actualizados** (`types/cancha.ts`)

#### Tipo `Cancha` (Interfaz Principal)
```typescript
export interface Cancha {
  // Campos base (siempre presentes):
  id: number;
  nombre: string;
  tipo: TipoCancha;
  techada: boolean;
  activa: boolean;
  establecimientoId: number;
  
  // Campos opcionales de solo lectura (vienen del backend):
  precioPorHora?: number;       // precio_desde
  rating?: number;              // rating_promedio
  totalResenas?: number;        // total_reviews
  descripcion?: string;
  capacidad?: number;
  imagenUrl?: string;           // foto_principal
  fechaCreacion?: string;
  fechaActualizacion?: string;
  estado?: EstadoCancha;        // Calculado de activa
}
```

#### Tipo `CreateCanchaInput` (Sin cambios)
```typescript
export interface CreateCanchaInput {
  nombre: string;
  tipo: TipoCancha;
  precioPorHora: number;     // UI interno (no se envía)
  descripcion?: string;       // UI interno (no se envía)
  capacidad: number;          // UI interno (no se envía)
  techada: boolean;
  establecimientoId: number;
  imagenUrl?: string;         // UI interno (no se envía)
}
```

#### Tipo `UpdateCanchaInput` (CORREGIDO)
```typescript
// SOLO campos que FastAPI acepta en UPDATE
export interface UpdateCanchaInput {
  nombre?: string;
  tipo?: TipoCancha;
  techada?: boolean;
  activa?: boolean;
}
```

---

### 2. **Servicio Actualizado** (`services/canchaService.ts`)

#### `adaptCanchaFromBackend()` - Actualizado
Ahora maneja correctamente los campos opcionales de FastAPI:
```typescript
return {
  id: backendCancha.id_cancha,
  nombre: backendCancha.nombre,
  tipo: backendCancha.deporte || 'futbol',
  techada: backendCancha.cubierta || false,
  activa: backendCancha.activo,
  establecimientoId: backendCancha.id_complejo,
  // Campos opcionales READ-ONLY:
  precioPorHora: backendCancha.precio_desde,
  rating: backendCancha.rating_promedio,
  totalResenas: backendCancha.total_reviews,
  descripcion: backendCancha.descripcion,
  capacidad: backendCancha.capacidad,
  imagenUrl: backendCancha.foto_principal,
  // ... más campos
};
```

#### `adaptCanchaToBackend()` - Sin cambios
Ya estaba correcto, solo envía los campos que FastAPI acepta.

---

### 3. **Página de Listado** (`admin/canchas/page.tsx`)

#### Cambios realizados:
1. **Importación actualizada**: Agregado `EstadoCancha`
2. **Mock data actualizado**: Usa estructura con campos opcionales
3. **Función `getEstadoFromCancha()`**: Calcula estado de `activa`
4. **Renderizado condicional**: Muestra "No configurado" si campos opcionales no existen

```typescript
{cancha.precioPorHora ? (
  <div className="admin-cell-text font-semibold">
    {formatPrice(cancha.precioPorHora)}
  </div>
) : (
  <div className="admin-cell-text text-gray-400">No configurado</div>
)}
```

---

### 4. **Página de Creación** (`admin/canchas/crear/page.tsx`)

#### Cambios principales:
1. **Formulario simplificado**: Solo muestra campos que FastAPI acepta
2. **Campos removidos del formulario**:
   - ❌ `precioPorHora`
   - ❌ `capacidad`
   - ❌ `descripcion`
   - ❌ `imagenUrl`
3. **Campo agregado**: `establecimientoId` (requerido por FastAPI)
4. **Validaciones actualizadas**: Solo valida campos requeridos
5. **Mensaje informativo**: Explica que otros campos se configuran desde backend

```typescript
const [formData, setFormData] = useState<CreateCanchaInput>({
  nombre: '',
  tipo: 'futbol',
  techada: false,
  establecimientoId: 1,
  // Campos UI internos (no se envían al backend):
  precioPorHora: 0,
  descripcion: '',
  capacidad: 1,
  imagenUrl: ''
});
```

---

### 5. **Página de Edición** (`admin/canchas/[id]/page.tsx`)

#### Cambios principales:
1. **FormData simplificado**: Solo campos editables
```typescript
const [formData, setFormData] = useState<UpdateCanchaInput>({
  nombre: '',
  tipo: 'futbol',
  techada: false,
  activa: true
});
```

2. **Campos removidos del formulario**:
   - ❌ `estado` (select) → reemplazado por checkbox `activa`
   - ❌ `precioPorHora`
   - ❌ `capacidad`
   - ❌ `descripcion`
   - ❌ `imagenUrl`

3. **Sección de solo lectura**: Muestra campos READ-ONLY si existen
```typescript
<div className="edit-section">
  <h3>Información de Solo Lectura</h3>
  {cancha.precioPorHora && (
    <div className="edit-info-item">
      <span>Precio por hora:</span>
      <span>{formatPrice(cancha.precioPorHora)}</span>
    </div>
  )}
  {/* ... más campos de solo lectura ... */}
</div>
```

4. **Checkbox `activa`**: Reemplaza el select de estado
```typescript
<input
  type="checkbox"
  name="activa"
  checked={formData.activa}
  onChange={handleInputChange}
/>
Cancha activa (disponible para reservas)
```

---

## 📋 Campos según FastAPI

### CREATE (CanchaCreateIn)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id_complejo` | int | ✅ Sí | ID del establecimiento |
| `nombre` | string | ✅ Sí | Nombre de la cancha |
| `deporte` | string | ❌ No | Tipo de deporte |
| `cubierta` | boolean | ❌ No | Si está techada |

### UPDATE (CanchaUpdateIn)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `nombre` | string | ❌ No | Nombre de la cancha |
| `deporte` | string | ❌ No | Tipo de deporte |
| `cubierta` | boolean | ❌ No | Si está techada |
| `activo` | boolean | ❌ No | Si está activa |

### GET (CanchaOut) - READ ONLY
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_cancha` | int | ID de la cancha |
| `precio_desde` | float | Precio mínimo (READ-ONLY) |
| `rating_promedio` | float | Rating promedio (READ-ONLY) |
| `total_reviews` | int | Total reseñas (READ-ONLY) |
| `descripcion` | string | Descripción (READ-ONLY) |
| `capacidad` | int | Capacidad (READ-ONLY) |
| `foto_principal` | string | URL imagen (READ-ONLY) |

---

## 🎯 Comportamiento Actual

### Crear Cancha
1. Usuario completa formulario con: `nombre`, `tipo`, `establecimientoId`, `techada`
2. `adaptCanchaToBackend()` genera payload: `{id_complejo, nombre, deporte, cubierta}`
3. POST `/admin/canchas` con JWT token
4. **⚠️ Espera 401** (backend necesita authMiddleware)

### Editar Cancha
1. GET `/admin/canchas/:id` carga datos completos (incluye campos READ-ONLY)
2. Formulario muestra solo campos editables: `nombre`, `tipo`, `techada`, `activa`
3. Campos READ-ONLY se muestran en sección separada (solo lectura)
4. `adaptCanchaToBackend()` genera payload: `{nombre, deporte, cubierta, activo}`
5. PATCH `/admin/canchas/:id` con JWT token
6. **⚠️ Espera 401** (backend necesita authMiddleware)

### Listar Canchas
1. GET `/canchas` (endpoint público)
2. Muestra todos los campos incluyendo READ-ONLY
3. Renderizado condicional para campos opcionales
4. Estado calculado de campo `activa`

---

## ✅ Verificación

### Sin errores de TypeScript:
```powershell
# Verificar compilación
npm run build

# Iniciar dev server
npm run dev
```

### Archivos actualizados:
- ✅ `types/cancha.ts` - Tipos alineados con FastAPI
- ✅ `services/canchaService.ts` - Adaptador actualizado
- ✅ `admin/canchas/page.tsx` - Listado con campos opcionales
- ✅ `admin/canchas/crear/page.tsx` - Solo campos de CREATE
- ✅ `admin/canchas/[id]/page.tsx` - Solo campos de UPDATE

---

## 🚫 Bloqueador Pendiente

**El backend aún necesita agregar `authMiddleware`** antes de `/api/admin` routes.

Ver: `PROBLEMA_AUTENTICACION_BACKEND.md`

---

## 📝 Notas Finales

1. **Frontend está listo** - Todos los campos y schemas correctos
2. **Separación clara** - Campos editables vs READ-ONLY
3. **Renderizado defensivo** - Maneja campos opcionales
4. **Compatibilidad** - Soporta tanto FastAPI como BFF legacy
5. **Esperando backend** - 401 se resolverá cuando backend agregue auth

**Siguiente paso**: Pedir al equipo de backend que agregue authMiddleware en `backend/src/index.ts` línea 110.
