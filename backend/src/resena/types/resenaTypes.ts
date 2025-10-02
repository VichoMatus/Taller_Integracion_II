// src/interfaces/types/resenaTypes.ts
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
  // opcional: distribución por estrellas
  breakdown?: Record<string, number>; // { "1": 3, "2": 5, "3": 20, "4": 40, "5": 59 }
}
