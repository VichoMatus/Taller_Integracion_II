/**
 * Interfaz de Reseña basada en la API de Taller4.
 * Puede reseñar una cancha O un complejo.
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
