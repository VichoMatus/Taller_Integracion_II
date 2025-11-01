/**
 * Interfaz de Reseña basada en la API de Taller4.
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
  fechaCreacion: string; // ISO
  fechaActualizacion?: string; // ISO
  // Campos agregados cuando se filtra por cancha/complejo
  promedioRating?: number;
  totalResenas?: number;
}

/**
 * Input para crear una reseña.
 * Requiere tener una reserva confirmada del destino (cancha o complejo).
 */
export interface ResenaCreateRequest {
  id_cancha?: number;
  id_complejo?: number;
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
  id_cancha?: number;
  id_complejo?: number;
  order?: "recientes" | "mejor" | "peor";
  page?: number;
  page_size?: number;
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
  id_reporte: number;
  id_resena: number;
  id_reportante: number;
  motivo?: string;
  created_at: string;
}
