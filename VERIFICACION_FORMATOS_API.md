# Verificación de Formatos API - Canchas

## 📊 Comparación: Lo que usa el Frontend vs Lo que espera la API

---

## 1️⃣ **LISTAR CANCHAS (GET)**

### **Lo que devuelve la API FastAPI:**
```json
{
  "id_cancha": 0,
  "id_complejo": 0,
  "nombre": "string",
  "deporte": "string",
  "cubierta": true,
  "activo": true,
  "precio_desde": 0,
  "rating_promedio": 0,
  "total_resenas": 0,
  "distancia_km": 0
}
```

### **Lo que recibe el Frontend (adaptCanchaFromBackend):**
```typescript
// Detecta formato con: 'id_cancha' in backendCancha
{
  id: backendCancha.id_cancha,              // ✅ id_cancha → id
  nombre: backendCancha.nombre,             // ✅ nombre → nombre
  tipo: backendCancha.deporte,              // ✅ deporte → tipo
  techada: backendCancha.cubierta,          // ✅ cubierta → techada
  activa: backendCancha.activo,             // ✅ activo → activa
  establecimientoId: backendCancha.id_complejo, // ✅ id_complejo → establecimientoId
  precioPorHora: backendCancha.precio_desde,    // ✅ precio_desde → precioPorHora
  rating: backendCancha.rating_promedio,        // ✅ rating_promedio → rating
  totalResenas: backendCancha.total_reviews,    // ⚠️ total_reviews vs total_resenas
  // ... más campos opcionales
}
```

### ❌ **PROBLEMA ENCONTRADO:**
```
API devuelve:  "total_resenas"
Frontend lee:  backendCancha.total_reviews  ❌ CAMPO INCORRECTO
```

**El frontend está leyendo `total_reviews` pero la API envía `total_resenas`**

---

## 2️⃣ **EDITAR CANCHA (PUT/PATCH)**

### **Lo que espera la API FastAPI:**
```json
{
  "nombre": "string",
  "id_deporte": 0,
  "deporte": "string",
  "cubierta": true,
  "activo": true
}
```

### **Lo que envía el Frontend (adaptCanchaToBackend con isUpdate=true):**
```typescript
const payload = {};

// Campos comunes a CREATE y UPDATE
if (frontendCancha.nombre !== undefined) {
  payload.nombre = frontendCancha.nombre;        // ✅ nombre
}

if (frontendCancha.tipo !== undefined) {
  payload.deporte = frontendCancha.tipo;         // ✅ deporte
}

if (frontendCancha.techada !== undefined) {
  payload.cubierta = frontendCancha.techada;     // ✅ cubierta
}

// Campo SOLO para UPDATE
if (isUpdate && frontendCancha.activa !== undefined) {
  payload.activo = frontendCancha.activa;        // ✅ activo
}

return payload;
```

**Resultado actual:**
```json
{
  "nombre": "string",     // ✅
  "deporte": "string",    // ✅
  "cubierta": true,       // ✅
  "activo": true          // ✅
}
```

### ❌ **PROBLEMA ENCONTRADO:**
```
API espera:    "id_deporte": 0  
Frontend envía: NO lo incluye ❌
```

**El frontend NO está enviando `id_deporte` en UPDATE**

---

## 3️⃣ **CREAR CANCHA (POST)**

### **Lo que espera la API FastAPI:**
```json
{
  "id_complejo": 0,
  "nombre": "string",
  "id_deporte": 0,
  "deporte": "string",
  "cubierta": false
}
```

### **Lo que envía el Frontend (adaptCanchaToBackend con isUpdate=false):**
```typescript
const payload = {};

// Campos comunes a CREATE y UPDATE
if (frontendCancha.nombre !== undefined) {
  payload.nombre = frontendCancha.nombre;        // ✅ nombre
}

if (frontendCancha.tipo !== undefined) {
  payload.deporte = frontendCancha.tipo;         // ✅ deporte
}

if (frontendCancha.techada !== undefined) {
  payload.cubierta = frontendCancha.techada;     // ✅ cubierta
}

// Campo SOLO para CREATE
if (!isUpdate && frontendCancha.establecimientoId !== undefined) {
  payload.id_complejo = frontendCancha.establecimientoId; // ✅ id_complejo
}

return payload;
```

**Resultado actual:**
```json
{
  "id_complejo": 0,       // ✅
  "nombre": "string",     // ✅
  "deporte": "string",    // ✅
  "cubierta": false       // ✅
}
```

### ❌ **PROBLEMA ENCONTRADO:**
```
API espera:    "id_deporte": 0  
Frontend envía: NO lo incluye ❌
```

**El frontend NO está enviando `id_deporte` en CREATE**

---

## 📋 **RESUMEN DE PROBLEMAS**

### ❌ **Problemas Identificados:**

| Operación | Campo | API Espera/Devuelve | Frontend Usa | Estado |
|-----------|-------|---------------------|--------------|--------|
| **GET (Listar)** | Total reseñas | `total_resenas` | `total_reviews` | ❌ Incorrecto |
| **POST (Crear)** | ID Deporte | `id_deporte` | NO lo envía | ❌ Falta campo |
| **PUT (Editar)** | ID Deporte | `id_deporte` | NO lo envía | ❌ Falta campo |

### ✅ **Lo que está correcto:**

- ✅ GET: `id_cancha`, `nombre`, `deporte`, `cubierta`, `activo`, `id_complejo`, `precio_desde`, `rating_promedio`
- ✅ POST: `id_complejo`, `nombre`, `deporte`, `cubierta`
- ✅ PUT: `nombre`, `deporte`, `cubierta`, `activo`

---

## 🔧 **CORRECCIONES NECESARIAS**

### **1. Corregir lectura en GET (adaptCanchaFromBackend):**

**Cambiar:**
```typescript
totalResenas: backendCancha.total_reviews,  // ❌
```

**Por:**
```typescript
totalResenas: backendCancha.total_resenas,  // ✅
```

---

### **2. Agregar id_deporte en CREATE (adaptCanchaToBackend):**

**Agregar en la función cuando isUpdate=false:**
```typescript
// Campo SOLO para CREATE
if (!isUpdate) {
  if (frontendCancha.establecimientoId !== undefined) {
    payload.id_complejo = frontendCancha.establecimientoId;
  }
  
  // NUEVO: Agregar id_deporte
  if ((frontendCancha as any).id_deporte !== undefined) {
    payload.id_deporte = (frontendCancha as any).id_deporte;
  }
}
```

**PERO:** ⚠️ El frontend no tiene el campo `id_deporte` en sus tipos. Necesitamos:
- O agregarlo al tipo `CreateCanchaInput`
- O usar un valor por defecto si la API lo requiere

---

### **3. Agregar id_deporte en UPDATE (adaptCanchaToBackend):**

**Agregar en la función cuando isUpdate=true:**
```typescript
// Campo SOLO para UPDATE
if (isUpdate) {
  if (frontendCancha.activa !== undefined) {
    payload.activo = frontendCancha.activa;
  }
  
  // NUEVO: Agregar id_deporte
  if ((frontendCancha as any).id_deporte !== undefined) {
    payload.id_deporte = (frontendCancha as any).id_deporte;
  }
}
```

**PERO:** ⚠️ El frontend no tiene el campo `id_deporte` en `UpdateCanchaInput`

---

## ❓ **PREGUNTAS CRÍTICAS**

### **Sobre `id_deporte`:**

1. **¿Es obligatorio el campo `id_deporte`?**
   - Si es opcional: No hay problema, la API lo manejará
   - Si es requerido: Necesitamos agregarlo a los tipos del frontend

2. **¿Qué relación tiene `id_deporte` con `deporte`?**
   - `deporte` es el nombre (string): "futbol", "basquet"
   - `id_deporte` es el ID numérico: 1, 2, 3...
   - ¿La API necesita ambos o solo uno?

3. **Si es necesario, ¿cómo lo obtenemos?**
   - ¿Necesitamos un endpoint para obtener deportes disponibles?
   - ¿Podemos mapear "futbol" → 1, "basquet" → 2, etc?
   - ¿La API puede inferir `id_deporte` desde `deporte`?

---

## 🎯 **RECOMENDACIÓN INMEDIATA**

### **Primero:** Corregir el problema de lectura (GET)

Este es simple y no tiene dependencias:

```typescript
// En adaptCanchaFromBackend, cambiar:
totalResenas: backendCancha.total_resenas,  // Correcto
```

### **Segundo:** Investigar sobre `id_deporte`

Necesitamos saber:
1. ¿Es obligatorio u opcional?
2. ¿Cómo se relaciona con el campo `deporte`?
3. ¿La API acepta solo `deporte` (string) o necesita `id_deporte` (number)?

### **Tercero:** Decidir estrategia según respuesta

**Opción A:** Si `id_deporte` es opcional
- ✅ No hacer nada, la API lo manejará

**Opción B:** Si `id_deporte` es requerido pero inferible
- ✅ Crear mapeo interno: `{"futbol": 1, "basquet": 2, ...}`
- ✅ Enviarlo automáticamente basado en el campo `deporte`

**Opción C:** Si `id_deporte` es requerido y NO inferible
- ❌ Agregar campo `id_deporte` a los formularios
- ❌ Modificar tipos `CreateCanchaInput` y `UpdateCanchaInput`
- ❌ Actualizar páginas de crear/editar

---

## 📝 **PRÓXIMOS PASOS**

1. ✅ Corregir `total_reviews` → `total_resenas` (simple)
2. ❓ Investigar requisitos de `id_deporte` en la API
3. ⏳ Implementar solución según resultado de investigación

