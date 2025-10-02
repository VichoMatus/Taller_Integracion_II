/**
 * Estados disponibles para una reseña.
 */
export type EstadoResena = "activa" | "oculta" | "reportada" | "eliminada";

/**
 * Entidad principal de reseña del sistema.
 * Representa una calificación y comentario de un usuario sobre un complejo deportivo.
 */
export interface Resena {
  /** Identificador único de la reseña */
  id: number;
  /** ID del usuario que escribió la reseña */
  usuarioId: number;
  /** ID del complejo reseñado */
  complejoId: number;
  /** Calificación numérica (1-5 estrellas) */
  calificacion: number;
  /** Comentario de la reseña */
  comentario: string;
  /** Estado actual de la reseña */
  estado: EstadoResena;
  /** Fecha de creación de la reseña */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
  /** Respuesta del dueño del complejo (opcional) */
  respuestaDueno?: string;
  /** Fecha de respuesta del dueño */
  fechaRespuesta?: Date;
  /** Indica si la reseña es verificada (usuario hizo reserva) */
  verificada: boolean;
  /** Número de "me gusta" que tiene la reseña */
  likes: number;
  /** Número de reportes que tiene la reseña */
  reportes: number;
  /** Información del usuario (desnormalizada para consultas) */
  usuario?: {
    id: number;
    email: string;
    nombre?: string;
    apellido?: string;
    avatarUrl?: string;
  };
  /** Información del complejo (desnormalizada para consultas) */
  complejo?: {
    id: number;
    nombre: string;
    direccion: string;
    calificacionPromedio?: number;
  };
}
