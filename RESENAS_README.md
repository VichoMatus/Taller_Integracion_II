# 📝 Módulo de Reseñas - Guía de Uso

## 📋 Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Tipos de Datos](#tipos-de-datos)
- [API del Servicio](#api-del-servicio)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Validaciones y Permisos](#validaciones-y-permisos)
- [Manejo de Errores](#manejo-de-errores)
- [Notas Importantes](#notas-importantes)

---

## 📖 Descripción General

El módulo de reseñas permite a los usuarios calificar y comentar sobre **canchas** o **complejos deportivos** después de haber realizado una reserva confirmada. Este módulo está basado en la API de Taller4 implementada en FastAPI.

### Características Principales
- ✅ Crear reseñas (requiere reserva confirmada)
- ✅ Listar reseñas con filtros avanzados
- ✅ Actualizar reseñas (solo el autor)
- ✅ Eliminar reseñas (con permisos escalonados)
- ✅ Reportar reseñas por contenido inapropiado
- ✅ Calificación de 1 a 5 estrellas
- ✅ Estadísticas agregadas (promedio y total)

---

## 🏗️ Arquitectura

```
Frontend (Next.js/React)
    ↓
resenaService.ts (Capa de Servicio)
    ↓
apiBackend (Axios - /api/resenas)
    ↓
Backend BFF (Express/TypeScript)
    ↓
FastAPI (Taller4 - /resenas)
    ↓
PostgreSQL Database
```

### Flujo de Datos

```typescript
// Frontend → Backend → API
{
  id_cancha: 10,
  calificacion: 5,
  comentario: "Excelente"
}

// API → Backend → Frontend
{
  ok: true,
  data: {
    id: 1,
    usuarioId: 5,
    canchaId: 10,
    complejoId: null,
    calificacion: 5,
    comentario: "Excelente",
    estado: "activa",
    fechaCreacion: "2025-10-30T12:00:00Z",
    fechaActualizacion: null,
    promedioRating: 4.5,    // Solo cuando se filtra por cancha/complejo
    totalResenas: 127       // Solo cuando se filtra por cancha/complejo
  }
}
```

---

## 📦 Tipos de Datos

### `Resena`
Representa una reseña en el sistema.

```typescript
interface Resena {
  id: number;                    // ID único de la reseña
  usuarioId: number;             // ID del usuario que creó la reseña
  canchaId?: number;             // ID de la cancha (opcional)
  complejoId?: number;           // ID del complejo (opcional)
  calificacion: number;          // Calificación de 1 a 5 estrellas
  comentario?: string;           // Comentario opcional del usuario
  estado: "activa" | "oculta" | "reportada" | "eliminada";
  fechaCreacion: string;         // Fecha de creación (ISO 8601)
  fechaActualizacion?: string;   // Fecha de última actualización (ISO 8601)
  // Campos agregados (solo cuando se filtra por cancha/complejo)
  promedioRating?: number;       // Promedio de calificación del destino
  totalResenas?: number;         // Total de reseñas del destino
}
```

### `ResenaCreateRequest`
Input para crear una nueva reseña.

```typescript
interface ResenaCreateRequest {
  id_cancha?: number;      // ID de la cancha (requerido id_cancha O id_complejo)
  id_complejo?: number;    // ID del complejo (requerido id_cancha O id_complejo)
  calificacion: number;    // Calificación de 1 a 5 (requerido)
  comentario?: string;     // Comentario opcional (min 10 chars, max 2000)
}
```

**Validaciones:**
- ✅ Debe indicar `id_cancha` O `id_complejo` (al menos uno)
- ✅ `calificacion` debe estar entre 1 y 5
- ✅ `comentario` opcional, pero si se proporciona:
  - Mínimo 10 caracteres
  - Máximo 2000 caracteres
- ✅ **El usuario debe tener una reserva confirmada del destino**

### `ResenaUpdateRequest`
Input para actualizar una reseña existente.

```typescript
interface ResenaUpdateRequest {
  calificacion?: number;   // Nueva calificación de 1 a 5
  comentario?: string;     // Nuevo comentario
}
```

**Validaciones:**
- ✅ Al menos uno de los campos debe estar presente
- ✅ Mismas validaciones que en crear reseña
- ✅ Solo el autor puede actualizar su reseña

### `ResenaListQuery`
Filtros para listar reseñas.

```typescript
interface ResenaListQuery {
  id_cancha?: number;                          // Filtrar por cancha
  id_complejo?: number;                        // Filtrar por complejo
  order?: "recientes" | "mejor" | "peor";      // Orden de resultados
  page?: number;                               // Número de página (1..N)
  page_size?: number;                          // Tamaño de página (1..100)
}
```

### `ReportarResenaInput`
Input para reportar una reseña.

```typescript
interface ReportarResenaInput {
  motivo?: string;         // Motivo del reporte (opcional, max 2000 chars)
}
```

### `ReporteResponse`
Respuesta al reportar una reseña.

```typescript
interface ReporteResponse {
  id_reporte: number;      // ID del reporte creado
  id_resena: number;       // ID de la reseña reportada
  id_reportante: number;   // ID del usuario que reporta
  motivo?: string;         // Motivo del reporte
  created_at: string;      // Fecha del reporte (ISO 8601)
}
```

---

## 🔧 API del Servicio

### `listarResenas(query?)`
Lista reseñas con filtros opcionales.

```typescript
listarResenas(query?: ResenaListQuery): Promise<Resena[]>
```

**Parámetros:**
- `query` (opcional): Objeto con filtros
  - `id_cancha`: Filtrar por ID de cancha
  - `id_complejo`: Filtrar por ID de complejo
  - `order`: Orden ("recientes" | "mejor" | "peor")
  - `page`: Número de página (default: 1)
  - `page_size`: Tamaño de página (default: 20, max: 100)

**Retorna:** Array de reseñas

**Ejemplo:**
```typescript
// Listar todas las reseñas (público)
const todas = await resenaService.listarResenas();

// Listar reseñas de una cancha ordenadas por mejor calificación
const resenas = await resenaService.listarResenas({
  id_cancha: 10,
  order: "mejor",
  page: 1,
  page_size: 10
});
```

**Notas:**
- ✅ No requiere autenticación
- ✅ Cuando se filtra por `id_cancha` o `id_complejo`, cada reseña incluye:
  - `promedioRating`: Promedio de calificaciones del destino
  - `totalResenas`: Total de reseñas del destino

---

### `crearResena(input)`
Crea una nueva reseña.

```typescript
crearResena(input: ResenaCreateRequest): Promise<Resena>
```

**Parámetros:**
- `input`: Objeto con datos de la reseña
  - `id_cancha` (opcional): ID de la cancha a reseñar
  - `id_complejo` (opcional): ID del complejo a reseñar
  - `calificacion` (requerido): Calificación de 1 a 5
  - `comentario` (opcional): Comentario del usuario

**Retorna:** Reseña creada

**Ejemplo:**
```typescript
try {
  const nuevaResena = await resenaService.crearResena({
    id_cancha: 10,
    calificacion: 5,
    comentario: "¡Excelente cancha! Muy bien mantenida."
  });
  
  console.log("Reseña creada:", nuevaResena);
} catch (error) {
  // Error: "Sólo puedes reseñar si tienes una reserva confirmada para este destino."
}
```

**Notas:**
- 🔒 **Requiere autenticación**
- ✅ El usuario debe tener una reserva confirmada del destino
- ✅ Debe indicar `id_cancha` O `id_complejo` (al menos uno)
- ✅ Validaciones automáticas del backend

---

### `actualizarResena(id, input)`
Actualiza una reseña existente.

```typescript
actualizarResena(id: number, input: ResenaUpdateRequest): Promise<Resena>
```

**Parámetros:**
- `id`: ID de la reseña a actualizar
- `input`: Objeto con campos a actualizar
  - `calificacion` (opcional): Nueva calificación
  - `comentario` (opcional): Nuevo comentario

**Retorna:** Reseña actualizada

**Ejemplo:**
```typescript
try {
  const actualizada = await resenaService.actualizarResena(123, {
    calificacion: 4,
    comentario: "Actualizo mi opinión después de otra visita."
  });
  
  console.log("Reseña actualizada:", actualizada);
} catch (error) {
  // Error: "No puedes editar esta reseña (no es tuya o no existe)."
}
```

**Notas:**
- 🔒 **Requiere autenticación**
- ✅ Solo el autor puede actualizar su reseña
- ✅ Al menos uno de los campos debe estar presente

---

### `eliminarResena(id)`
Elimina una reseña.

```typescript
eliminarResena(id: number): Promise<void>
```

**Parámetros:**
- `id`: ID de la reseña a eliminar

**Retorna:** `void` (status 204)

**Ejemplo:**
```typescript
try {
  await resenaService.eliminarResena(123);
  console.log("Reseña eliminada exitosamente");
} catch (error) {
  // Error: "No tienes permisos para borrar esta reseña."
}
```

**Notas:**
- 🔒 **Requiere autenticación**
- ✅ Permisos escalonados:
  - **Autor**: Puede eliminar su propia reseña
  - **Admin/Dueño**: Pueden eliminar reseñas de sus complejos/canchas
  - **Superadmin**: Puede eliminar cualquier reseña

---

### `reportarResena(id, input)`
Reporta una reseña por contenido inapropiado.

```typescript
reportarResena(id: number, input: ReportarResenaInput): Promise<ReporteResponse>
```

**Parámetros:**
- `id`: ID de la reseña a reportar
- `input`: Objeto con datos del reporte
  - `motivo` (opcional): Motivo del reporte

**Retorna:** Datos del reporte creado

**Ejemplo:**
```typescript
try {
  const reporte = await resenaService.reportarResena(123, {
    motivo: "Lenguaje ofensivo e insultos directos"
  });
  
  console.log("Reporte creado:", reporte);
} catch (error) {
  console.error("Error al reportar:", error);
}
```

**Notas:**
- 🔒 **Requiere autenticación**
- ✅ 1 reporte por usuario por reseña (UPSERT)
- ✅ No elimina ni oculta la reseña, solo la marca para moderación

---

### `obtenerResenasPorCancha(canchaId, order?, page?, pageSize?)`
Helper para obtener reseñas de una cancha específica.

```typescript
obtenerResenasPorCancha(
  canchaId: number,
  order?: "recientes" | "mejor" | "peor",
  page?: number,
  pageSize?: number
): Promise<Resena[]>
```

**Parámetros:**
- `canchaId`: ID de la cancha
- `order` (opcional): Orden de resultados
- `page` (opcional): Número de página
- `pageSize` (opcional): Tamaño de página

**Retorna:** Array de reseñas (incluye `promedioRating` y `totalResenas`)

**Ejemplo:**
```typescript
// Obtener las mejores reseñas de una cancha
const mejores = await resenaService.obtenerResenasPorCancha(10, "mejor", 1, 5);

console.log(`Promedio: ${mejores[0]?.promedioRating}`);
console.log(`Total: ${mejores[0]?.totalResenas}`);
```

---

### `obtenerResenasPorComplejo(complejoId, order?, page?, pageSize?)`
Helper para obtener reseñas de un complejo específico.

```typescript
obtenerResenasPorComplejo(
  complejoId: number,
  order?: "recientes" | "mejor" | "peor",
  page?: number,
  pageSize?: number
): Promise<Resena[]>
```

**Parámetros:**
- `complejoId`: ID del complejo
- `order` (opcional): Orden de resultados
- `page` (opcional): Número de página
- `pageSize` (opcional): Tamaño de página

**Retorna:** Array de reseñas (incluye `promedioRating` y `totalResenas`)

**Ejemplo:**
```typescript
// Obtener reseñas recientes de un complejo
const recientes = await resenaService.obtenerResenasPorComplejo(5, "recientes");
```

---

## 💡 Ejemplos de Uso

### Caso 1: Mostrar reseñas en la página de una cancha

```typescript
"use client";

import { useState, useEffect } from 'react';
import { resenaService } from '@/services/resenaService';
import { Resena } from '@/types/resena';

export default function CanchaResenasPage({ canchaId }: { canchaId: number }) {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [orden, setOrden] = useState<"recientes" | "mejor" | "peor">("recientes");

  useEffect(() => {
    cargarResenas();
  }, [canchaId, orden]);

  const cargarResenas = async () => {
    try {
      setLoading(true);
      const data = await resenaService.obtenerResenasPorCancha(
        canchaId,
        orden,
        1,
        10
      );
      setResenas(data);
    } catch (error) {
      console.error("Error al cargar reseñas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando reseñas...</div>;

  return (
    <div className="resenas-container">
      {/* Estadísticas */}
      {resenas.length > 0 && (
        <div className="stats">
          <h3>Calificación Promedio: {resenas[0].promedioRating?.toFixed(1)} ⭐</h3>
          <p>{resenas[0].totalResenas} reseñas</p>
        </div>
      )}

      {/* Filtros */}
      <select value={orden} onChange={(e) => setOrden(e.target.value as any)}>
        <option value="recientes">Más recientes</option>
        <option value="mejor">Mejor calificadas</option>
        <option value="peor">Peor calificadas</option>
      </select>

      {/* Lista de reseñas */}
      <div className="resenas-lista">
        {resenas.map((resena) => (
          <div key={resena.id} className="resena-card">
            <div className="rating">{"⭐".repeat(resena.calificacion)}</div>
            <p>{resena.comentario}</p>
            <small>{new Date(resena.fechaCreacion).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Caso 2: Crear una reseña después de una reserva

```typescript
"use client";

import { useState } from 'react';
import { resenaService } from '@/services/resenaService';
import { ResenaCreateRequest } from '@/types/resena';

export default function CrearResenaForm({ canchaId }: { canchaId: number }) {
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validaciones del frontend
    if (comentario.length < 10) {
      setError("El comentario debe tener al menos 10 caracteres");
      return;
    }

    try {
      setLoading(true);

      const input: ResenaCreateRequest = {
        id_cancha: canchaId,
        calificacion,
        comentario: comentario.trim() || undefined
      };

      await resenaService.crearResena(input);
      setSuccess(true);
      setComentario("");
      setCalificacion(5);

      // Opcional: Recargar página o actualizar lista
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Error al crear la reseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="crear-resena-form">
      <h3>Deja tu reseña</h3>

      {/* Selector de calificación */}
      <div className="calificacion-selector">
        <label>Calificación:</label>
        <div className="estrellas">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setCalificacion(star)}
              className={star <= calificacion ? "active" : ""}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      {/* Comentario */}
      <div className="comentario-input">
        <label>Comentario (opcional):</label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Comparte tu experiencia... (mínimo 10 caracteres)"
          rows={4}
          maxLength={2000}
        />
        <small>{comentario.length}/2000</small>
      </div>

      {/* Mensajes */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">¡Reseña creada exitosamente!</div>}

      {/* Botón */}
      <button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Publicar Reseña"}
      </button>
    </form>
  );
}
```

---

### Caso 3: Editar una reseña propia

```typescript
"use client";

import { useState } from 'react';
import { resenaService } from '@/services/resenaService';
import { Resena, ResenaUpdateRequest } from '@/types/resena';

export default function EditarResenaForm({ resena }: { resena: Resena }) {
  const [calificacion, setCalificacion] = useState(resena.calificacion);
  const [comentario, setComentario] = useState(resena.comentario || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError("");

      const input: ResenaUpdateRequest = {
        calificacion,
        comentario: comentario.trim() || undefined
      };

      await resenaService.actualizarResena(resena.id, input);
      alert("Reseña actualizada exitosamente");
      
    } catch (err: any) {
      setError(err.message || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editar-resena">
      <h3>Editar Reseña</h3>

      <div className="calificacion">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setCalificacion(star)}
            className={star <= calificacion ? "active" : ""}
          >
            ⭐
          </button>
        ))}
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={4}
        maxLength={2000}
      />

      {error && <div className="error">{error}</div>}

      <button onClick={handleUpdate} disabled={loading}>
        {loading ? "Guardando..." : "Guardar Cambios"}
      </button>
    </div>
  );
}
```

---

### Caso 4: Eliminar una reseña

```typescript
"use client";

import { resenaService } from '@/services/resenaService';

export default function EliminarResenaButton({ resenaId }: { resenaId: number }) {
  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reseña?")) {
      return;
    }

    try {
      await resenaService.eliminarResena(resenaId);
      alert("Reseña eliminada exitosamente");
      window.location.reload(); // O actualizar el estado
    } catch (error: any) {
      alert(error.message || "Error al eliminar la reseña");
    }
  };

  return (
    <button onClick={handleDelete} className="btn-danger">
      Eliminar Reseña
    </button>
  );
}
```

---

### Caso 5: Reportar una reseña

```typescript
"use client";

import { useState } from 'react';
import { resenaService } from '@/services/resenaService';

export default function ReportarResenaButton({ resenaId }: { resenaId: number }) {
  const [showModal, setShowModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    try {
      setLoading(true);
      
      await resenaService.reportarResena(resenaId, {
        motivo: motivo.trim() || undefined
      });
      
      alert("Reporte enviado. Gracias por tu colaboración.");
      setShowModal(false);
      setMotivo("");
      
    } catch (error: any) {
      alert(error.message || "Error al enviar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn-report">
        🚩 Reportar
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Reportar Reseña</h3>
            <p>¿Por qué reportas esta reseña?</p>

            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe el problema (opcional)"
              rows={3}
              maxLength={2000}
            />

            <div className="modal-actions">
              <button onClick={handleReport} disabled={loading}>
                {loading ? "Enviando..." : "Enviar Reporte"}
              </button>
              <button onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## 🔒 Validaciones y Permisos

### Validaciones del Frontend
```typescript
// Calificación
calificacion >= 1 && calificacion <= 5

// Comentario (si existe)
comentario.length >= 10 && comentario.length <= 2000

// Debe indicar destino
id_cancha || id_complejo
```

### Validaciones del Backend
- ✅ Usuario tiene reserva confirmada del destino
- ✅ Calificación válida (1-5)
- ✅ Longitud de comentario
- ✅ Usuario autenticado
- ✅ Permisos según rol

### Permisos por Operación

| Operación | Público | Usuario | Admin | Superadmin |
|-----------|---------|---------|-------|------------|
| **Listar** | ✅ | ✅ | ✅ | ✅ |
| **Crear** | ❌ | ✅* | ✅* | ✅* |
| **Actualizar** | ❌ | ✅** | ❌ | ❌ |
| **Eliminar** | ❌ | ✅** | ✅*** | ✅ |
| **Reportar** | ❌ | ✅ | ✅ | ✅ |

\* Requiere reserva confirmada  
\** Solo sus propias reseñas  
\*** Solo reseñas de sus complejos/canchas  

---

## ⚠️ Manejo de Errores

### Errores Comunes

```typescript
// 400 - Bad Request
{
  error: "La calificación debe estar entre 1 y 5 estrellas"
}

// 403 - Forbidden
{
  error: "Sólo puedes reseñar si tienes una reserva confirmada para este destino."
}

// 403 - Forbidden (actualizar)
{
  error: "No puedes editar esta reseña (no es tuya o no existe)."
}

// 403 - Forbidden (eliminar)
{
  error: "No tienes permisos para borrar esta reseña."
}

// 404 - Not Found
{
  error: "La reseña no existe."
}

// 401 - Unauthorized
{
  error: "No autorizado. Debes iniciar sesión."
}
```

### Manejo Recomendado

```typescript
try {
  const resena = await resenaService.crearResena(input);
  // Éxito
} catch (error: any) {
  if (error.response?.status === 403) {
    // Usuario no tiene reserva confirmada
    alert("Necesitas tener una reserva confirmada para dejar una reseña");
  } else if (error.response?.status === 400) {
    // Validación fallida
    alert(error.response.data.error || "Datos inválidos");
  } else if (error.response?.status === 401) {
    // No autenticado
    router.push("/login");
  } else {
    // Error genérico
    alert("Error al crear la reseña. Intenta nuevamente.");
  }
}
```

---

## 📌 Notas Importantes

### 1. Autenticación
Todos los métodos excepto `listarResenas` requieren token de autenticación en el header:
```typescript
Authorization: Bearer <token>
```

### 2. Formato de Fechas
Todas las fechas se devuelven en formato ISO 8601:
```typescript
"2025-10-30T12:34:56.789Z"
```

### 3. Estadísticas Agregadas
Los campos `promedioRating` y `totalResenas` solo aparecen cuando:
- Se filtra por `id_cancha` O `id_complejo`
- Son calculados en tiempo real por la base de datos

### 4. Estados de Reseña
```typescript
type EstadoResena = 
  | "activa"      // Visible públicamente
  | "oculta"      // Oculta temporalmente
  | "reportada"   // Reportada por usuarios
  | "eliminada"   // Eliminada del sistema
```

### 5. Orden de Resultados
```typescript
- "recientes": Ordenadas por fecha de creación (DESC)
- "mejor":     Ordenadas por calificación más alta
- "peor":      Ordenadas por calificación más baja
```

### 6. Paginación
```typescript
// Default
page = 1
page_size = 20

// Límites
page >= 1
page_size: 1..100
```

### 7. Respuesta del Backend
El backend siempre devuelve:
```typescript
{
  ok: boolean,
  data: Resena | Resena[] | ReporteResponse
}
```

El servicio extrae automáticamente el `data`.

---

## 🚀 Endpoints Disponibles

```
Backend BFF: http://localhost:4000
```

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/resenas` | Lista reseñas con filtros | No |
| POST | `/api/resenas` | Crea nueva reseña | Sí |
| PATCH | `/api/resenas/:id` | Actualiza reseña | Sí |
| DELETE | `/api/resenas/:id` | Elimina reseña | Sí |
| POST | `/api/resenas/:id/reportar` | Reporta reseña | Sí |
| GET | `/api/resenas/status` | Estado del módulo | No |

---

## 📚 Referencias

- **Backend BFF**: `/backend/src/resenas/`
- **API FastAPI**: `/Taller4/backend/app/modules/resenas/`
- **Tipos Frontend**: `/sporthub-temuco/src/types/resena.ts`
- **Servicio Frontend**: `/sporthub-temuco/src/services/resenaService.ts`

---

## 🤝 Contribuciones

Para agregar nuevas funcionalidades o reportar bugs, contacta al equipo de desarrollo.

---

**Última actualización:** 30 de octubre de 2025  
**Versión API:** 1.0.0  
**Autor:** Equipo SportHub Temuco
