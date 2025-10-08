// src/types/horarios.ts
export interface Horario {
  id_horario: string | number;
  id_cancha: string | number;
  dia_semana: number; // 0=Dom ... 6=Sáb
  inicio: string;     // "HH:mm"
  fin: string;        // "HH:mm"
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface HorarioCreate {
  id_cancha: string | number;
  dia_semana: number;
  inicio: string;
  fin: string;
  activo?: boolean;
}

export interface HorarioUpdate {
  dia_semana?: number;
  inicio?: string;
  fin?: string;
  activo?: boolean;
}

export interface HorarioListQuery {
  id_cancha?: string | number;
  dia_semana?: number;
  activo?: boolean;
  page?: number;
  size?: number;
}
