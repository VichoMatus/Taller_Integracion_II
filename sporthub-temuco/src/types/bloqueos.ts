export interface Bloqueo {
  id_bloqueo: number | string;
  id_cancha: number | string;
  motivo: string | null;
  inicio: string; // ISO datetime
  fin: string;   // ISO datetime
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface BloqueoCreate {
  id_cancha: number | string;
  motivo?: string | null;
  inicio: string;
  fin: string;
}

export interface BloqueoUpdate {
  motivo?: string | null;
  inicio?: string;
  fin?: string;
}

export interface BloqueoListQuery {
  id_cancha?: number | string;
  desde?: string;
  hasta?: string;
  page?: number;
  size?: number;
}
