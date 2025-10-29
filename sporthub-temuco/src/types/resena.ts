export interface Resena {
  id_resena: number | string;
  id_usuario: number | string;
  id_cancha: number | string;
  id_reserva?: number | string | null;
  calificacion: number; // 1..5
  comentario: string | null;
  fecha_creacion: string;      // ISO
  fecha_actualizacion: string; // ISO
}

export interface ResenaCreateRequest {
  id_usuario: number | string;
  id_cancha: number | string;
  id_reserva?: number | string | null;
  calificacion: number; // 1..5
  comentario?: string | null;
}

export interface ResenaUpdateRequest {
  calificacion?: number; // 1..5
  comentario?: string | null;
}

export interface ResenaListQuery {
  id_usuario?: number | string;
  id_cancha?: number | string;
  calificacion_min?: number; // 1..5
  calificacion_max?: number; // 1..5
  page?: number;
  size?: number;
}

export interface ResumenCalificacion {
  id_cancha: number | string;
  promedio: number;       // e.g. 4.3
  total_resenas: number;  // e.g. 127
  breakdown?: Record<string, number>; // { "1": 3, "2": 5, "3": 20, "4": 40, "5": 59 }
}

// Tipos para estadísticas de complejo
export interface EstadisticasComplejo {
  complejo_id: number;
  promedio_general: number;
  total_resenas: number;
  resenas_por_mes: Record<string, number>;
  calificaciones_por_estrella: Record<string, number>;
  resenas_recientes: Resena[];
}

// Tipos para likes en reseñas
export interface LikeResponse {
  resena_id: number;
  usuario_id: number;
  liked: boolean;
  total_likes: number;
}

// Tipos para reportes
export interface ReportarResenaInput {
  motivo: string;
  descripcion?: string;
}

export interface ReporteResponse {
  resena_id: number;
  usuario_id: number;
  motivo: string;
  estado: "pendiente" | "revisado" | "resuelto";
  fecha_reporte: string;
}

// Tipos para respuestas de dueño
export interface ResponderResenaInput {
  respuesta: string;
}

export interface RespuestaResena {
  id: number;
  resena_id: number;
  usuario_id: number; // ID del dueño que responde
  respuesta: string;
  fecha_respuesta: string;
}

// Reseña extendida con todas las funcionalidades
export interface ResenaExtendida extends Resena {
  likes_count?: number;
  user_liked?: boolean;
  respuesta?: RespuestaResena;
  reportada?: boolean;
  usuario_nombre?: string;
  cancha_nombre?: string;
}
