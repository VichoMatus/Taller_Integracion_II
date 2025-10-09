/**
 * Entidades del dominio de disponibilidad
 * Incluye horarios, bloqueos y slots de disponibilidad
 */

export interface Horario {
  id_horario: number;
  id_complejo: number;
  id_cancha?: number;
  dia_semana: string; // 'lunes', 'martes', etc. o 'todos'
  hora_apertura: string; // formato HH:MM
  hora_cierre: string; // formato HH:MM
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Bloqueo {
  id_bloqueo: number;
  id_cancha: number;
  id_complejo: number;
  fecha_inicio: string; // ISO string
  fecha_fin: string; // ISO string
  motivo: string;
  es_recurrente: boolean;
  recurrencia_tipo?: 'diaria' | 'semanal' | 'mensual';
  activo: boolean;
  created_by: number; // id del usuario que creó el bloqueo
  created_at?: string;
  updated_at?: string;
}

export interface DisponibilidadSlot {
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fin: string; // HH:MM
  disponible: boolean;
  precio?: number;
  id_cancha: number;
  id_complejo: number;
  motivo_no_disponible?: string; // si no está disponible
}

export interface DisponibilidadConsulta {
  id_complejo?: number;
  id_cancha?: number;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string; // YYYY-MM-DD
  solo_disponibles?: boolean;
}

// DTOs de entrada
export interface CreateHorarioInput {
  id_complejo: number;
  id_cancha?: number;
  dia_semana: string;
  hora_apertura: string;
  hora_cierre: string;
}

export interface UpdateHorarioInput {
  dia_semana?: string;
  hora_apertura?: string;
  hora_cierre?: string;
  activo?: boolean;
}

export interface CreateBloqueoInput {
  id_cancha: number;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  es_recurrente?: boolean;
  recurrencia_tipo?: 'diaria' | 'semanal' | 'mensual';
}