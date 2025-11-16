/**
 * Interfaz de Reseña basada en el backend BFF (camelCase).
 * El backend convierte desde snake_case de la API Taller4.
 * Puede reseñar una cancha O un complejo.
 */
export interface Resena {
  id: number;
  usuarioId: number;
  canchaId?: number;
  complejoId?: number;
  calificacion: number; // 1..5
  comentario?: string;
  estado: "activa" | "oculta" | "reportada" | "eliminada";
  fechaCreacion: string; // ISO string format
  fechaActualizacion?: string; // ISO string format
  // Campos agregados cuando se filtra por cancha/complejo
  promedioRating?: number;
  totalResenas?: number;
}

/**
 * Input para crear una reseña.
 * Requiere tener una reserva confirmada del destino (cancha o complejo).
 */
export interface ResenaCreateRequest {
  canchaId?: number;
  complejoId?: number;
  calificacion: number; // 1..5
  comentario?: string;
}

/**
 * Input para actualizar una reseña (solo el autor).
 */
export interface ResenaUpdateRequest {
  calificacion?: number; // 1..5
  comentario?: string;
}

/**
 * Query para listar reseñas con filtros.
 */
export interface ResenaListQuery {
  canchaId?: number;
  complejoId?: number;
  order?: "recientes" | "mejor" | "peor";
  page?: number;
  pageSize?: number;
}

/**
 * Input para reportar una reseña por contenido inapropiado.
 */
export interface ReportarResenaInput {
  motivo?: string;
}

/**
 * Respuesta al reportar una reseña.
 */
export interface ReporteResponse {
  idReporte: number;
  idResena: number;
  idReportante: number;
  motivo?: string;
  fechaCreacion: string;
}