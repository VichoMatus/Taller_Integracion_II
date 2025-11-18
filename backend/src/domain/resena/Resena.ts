/**
 * Estados disponibles para una reseña.
 */
export type EstadoResena = "activa" | "oculta" | "reportada" | "eliminada";

/**
 * Entidad principal de reseña del sistema basada en la API de Taller4.
 * Puede reseñar una cancha O un complejo (o ambos).
 * 
 * NOTA: Las fechas se mantienen como strings ISO para compatibilidad
 * con el frontend y evitar problemas de serialización.
 */
export interface Resena {
  /** Identificador único de la reseña */
  id: number;
  /** ID del usuario que escribió la reseña */
  usuarioId: number;
  /** ID de la cancha reseñada (opcional) */
  canchaId?: number;
  /** ID del complejo reseñado (opcional) */
  complejoId?: number;
  /** Calificación numérica (1-5 estrellas) */
  calificacion: number;
  /** Comentario de la reseña (opcional) */
  comentario?: string;
  /** Estado actual de la reseña (basado en esta_activa) */
  estado: EstadoResena;
  /** Fecha de creación de la reseña (ISO string) */
  fechaCreacion: string;
  /** Fecha de última actualización (ISO string, opcional) */
  fechaActualizacion?: string;
  /** Promedio de rating agregado (cuando se filtra por cancha/complejo) */
  promedioRating?: number;
  /** Total de reseñas (cuando se filtra por cancha/complejo) */
  totalResenas?: number;
}