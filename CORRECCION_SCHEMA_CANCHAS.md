# 📝 Corrección del Schema de Canchas - FastAPI

## 🚨 Descubrimiento Crítico

Después de revisar el **OpenAPI schema real** de FastAPI, descubrimos que:

1. ❌ **CREATE** y **UPDATE** usan schemas **DIFERENTES**
2. ❌ Campos como `precio_desde`, `capacidad` son **SOLO LECTURA** (no aceptados en CREATE/UPDATE)
3. ❌ El campo `activo` **SOLO existe en UPDATE**, no en CREATE
4. ✅ CREATE solo acepta: `id_complejo`, `nombre`, `deporte`, `cubierta`
5. ✅ UPDATE solo acepta: `nombre`, `deporte`, `cubierta`, `activo`

## Problema Detectado

El adaptador estaba enviando campos que **NO coincidían** con el schema real de FastAPI.

### Schema Real de FastAPI (GET Response)

Según la API en `/docs`:

```json
{
  "id_cancha": 0,
  "id_complejo": 0,
  "nombre": "string",
  "deporte": "string",
  "cubierta": true,
  "activo": true,
  "precio_desde": 0,
  "rating_promedio": 0,      // opcional
  "total_resenas": 0,        // opcional
  "distancia_km": 0          // opcional
}
```

### Schema para CREATE (POST Request) - `CanchaCreateIn`

```json
{
  "id_complejo": 0,          // ✅ REQUERIDO
  "nombre": "string",        // ✅ REQUERIDO
  "deporte": "string",       // ⚠️  OPCIONAL (nombre del deporte)
  "cubierta": false          // ⚠️  OPCIONAL (default: false)
}
```

**Campos que NO existen en CREATE:**
- ❌ `activo` - No se puede establecer en CREATE
- ❌ `precio_desde` - Solo lectura (calculado por backend)
- ❌ `capacidad` - No existe en el schema
- ❌ `descripcion` - No existe en el schema

### Schema para UPDATE (PATCH Request) - `CanchaUpdateIn`

```json
{
  "nombre": "string",        // ⚠️  OPCIONAL
  "deporte": "string",       // ⚠️  OPCIONAL
  "cubierta": false,         // ⚠️  OPCIONAL
  "activo": true             // ⚠️  OPCIONAL (solo en UPDATE)
}
```

**Campos que NO existen en UPDATE:**
- ❌ `id_complejo` - No se puede cambiar
- ❌ `precio_desde` - Solo lectura
- ❌ `capacidad` - No existe en el schema

## Campos que estábamos enviando INCORRECTAMENTE

❌ Antes enviábamos (INCORRECTO):
```typescript
// CREATE
{
  nombre: "...",
  deporte: "...",
  descripcion: "",           // ❌ NO existe
  capacidad: 10,             // ❌ NO existe
  precio_desde: 5000,        // ❌ NO existe (solo lectura)
  cubierta: false,
  id_complejo: 1,
  foto_principal: "",        // ❌ NO existe
  activo: true               // ❌ NO existe en CREATE
}
```

## Corrección Aplicada (v2)

✅ Ahora enviamos **CREATE** (según schema real CanchaCreateIn):
```typescript
{
  id_complejo: 1,            // ✅ REQUERIDO
  nombre: "Cancha Norte",    // ✅ REQUERIDO
  deporte: "futbol",         // ✅ OPCIONAL
  cubierta: false            // ✅ OPCIONAL
}
```

✅ Ahora enviamos **UPDATE** (según schema real CanchaUpdateIn):
```typescript
{
  nombre: "Nuevo nombre",    // ⚠️ Solo si se modifica
  deporte: "tenis",          // ⚠️ Solo si se modifica
  cubierta: true,            // ⚠️ Solo si se modifica
  activo: false              // ⚠️ Solo si se modifica (solo en UPDATE)
}
```

## Diferencias con el Mapper del BFF

El BFF tiene un mapper en `backend/src/canchas/infrastructure/mappers.ts` que usa nombres **diferentes**:

```typescript
// Mapper del BFF (INCORRECTO para FastAPI directo)
{
  precio_por_hora: number,       // ❌ FastAPI usa "precio_desde"
  establecimiento_id: number,    // ❌ FastAPI usa "id_complejo"
  tipo: string,                  // ❌ FastAPI usa "deporte"
  techada: boolean,              // ❌ FastAPI usa "cubierta"
}
```

**Razón**: El BFF tiene su propio modelo de dominio diferente al de FastAPI.

## Archivos Modificados

### 1. `sporthub-temuco/src/services/canchaService.ts`

**Cambios en `adaptCanchaToBackend()`:**
- ✅ Cambiado el orden de los campos para coincidir con el schema
- ✅ Removidos campos que no existen: `descripcion`, `foto_principal`
- ✅ Agregada documentación del schema esperado
- ✅ Campo `capacidad` ahora es opcional (solo si está presente)

**Cambios en `adaptCanchaFromBackend()`:**
- ✅ Documentación actualizada con schema real
- ✅ Fallback mejorado para ambos formatos (snake_case y camelCase)

## Testing

Para probar si funciona, usar curl:

```bash
# Con el token válido
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:4000/api/admin/canchas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id_complejo": 1,
    "nombre": "Cancha Test",
    "deporte": "futbol",
    "cubierta": false,
    "activo": true,
    "precio_desde": 10000
  }'
```

## Notas Importantes

⚠️ **Aún persiste el problema de autenticación 401** - Este fix del schema es correcto pero NO resuelve el problema de autenticación. El backend aún necesita agregar `authMiddleware` antes de las rutas `/api/admin`.

Este cambio asegura que **cuando el backend esté configurado correctamente**, los datos se envíen en el formato exacto que FastAPI espera.

## Referencias

- Schema real de FastAPI: `http://api-h1d7oi-a881cc-168-232-167-73.traefik.me/docs`
- Mapper del BFF: `backend/src/canchas/infrastructure/mappers.ts`
- Adaptadores frontend: `sporthub-temuco/src/services/canchaService.ts`
