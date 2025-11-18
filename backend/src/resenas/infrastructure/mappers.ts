import { Resena } from "../../domain/resena/Resena";

/**
 * Tipo que representa la estructura de reseña en FastAPI de Taller4.
 * Basado en ResenaOut del schema de Python.
 * Utiliza convención snake_case como es estándar en Python.
 * 
 * Estructura real de la API:
 * {
 *   "id_resena": 0,
 *   "id_usuario": 0,
 *   "id_cancha": 0,
 *   "id_complejo": 0,
 *   "calificacion": 0,
 *   "comentario": "string",
 *   "esta_activa": true,
 *   "created_at": "2025-11-13T19:52:21.387Z",
 *   "updated_at": "2025-11-13T19:52:21.387Z",
 *   "promedio_rating": 0,
 *   "total_resenas": 0
 * }
 */
export type FastResena = {
  id_resena: number;
  id_usuario: number;
  id_cancha?: number | null;
  id_complejo?: number | null;
  calificacion: number;
  comentario?: string | null;
  esta_activa: boolean;
  created_at: string; // ISO string
  updated_at?: string | null; // ISO string
  // Campos adicionales cuando se filtra por cancha/complejo
  promedio_rating?: number | null;
  total_resenas?: number | null;
};

/**
 * Convierte reseña de formato FastAPI (snake_case) a formato del dominio (camelCase).
 * IMPORTANTE: Las fechas se mantienen como strings ISO para consistencia con el frontend.
 *
 * @param r - Reseña en formato FastAPI
 * @returns Reseña en formato del dominio
 */
export const toResena = (r: FastResena): Resena => ({
  id: r.id_resena,
  usuarioId: r.id_usuario,
  canchaId: r.id_cancha ?? undefined,
  complejoId: r.id_complejo ?? undefined,
  calificacion: r.calificacion,
  comentario: r.comentario ?? undefined,
  estado: r.esta_activa ? "activa" : "oculta",
  fechaCreacion: r.created_at, // Mantener como string ISO
  fechaActualizacion: r.updated_at ?? undefined, // Mantener como string ISO
  // Campos agregados cuando se consulta por cancha/complejo
  promedioRating: r.promedio_rating ?? undefined,
  totalResenas: r.total_resenas ?? undefined,
});
