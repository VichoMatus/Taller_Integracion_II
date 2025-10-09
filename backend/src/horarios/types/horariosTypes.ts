// src/horarios/type/horariosTypes.ts

export type DiaSemana =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6   // 0 = domingo ... 6 = sábado
  | "DOM" | "LUN" | "MAR" | "MIE" | "JUE" | "VIE" | "SAB";

export interface Horario {
  id_horario: number | string;
  id_cancha: number | string;
  dia_semana: DiaSemana;
  inicio: string;       // "HH:mm" o ISO datetime según backend
  fin: string;          // idem
  activo: boolean;
  precio_override?: number | null; // si tu backend permite precio por bloque
  fecha_creacion: string;          // ISO
  fecha_actualizacion: string;     // ISO
}

export interface HorarioCreate {
  id_cancha: number | string;
  dia_semana: DiaSemana;
  inicio: string;
  fin: string;
  activo?: boolean;
  precio_override?: number | null;
}

export interface HorarioUpdate {
  dia_semana?: DiaSemana;
  inicio?: string;
  fin?: string;
  activo?: boolean;
  precio_override?: number | null;
}

export interface HorarioListQuery {
  id_cancha?: number | string;
  id_complejo?: number | string;
  dia_semana?: DiaSemana;
  activo?: boolean;
  page?: number;
  size?: number;
}
