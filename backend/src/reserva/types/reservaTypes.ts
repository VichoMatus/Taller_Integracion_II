// src/interfaces/types/reservaTypes.ts
export type ReservaEstado = "PENDIENTE" | "CONFIRMADA" | "CANCELADA";

export interface Reserva {
  id_reserva: number | string;
  id_usuario: number | string;
  id_cancha: number | string;
  inicio: string; // ISO datetime
  fin: string;    // ISO datetime
  estado: ReservaEstado;
  precio_total: number;
  notas: string | null;
  fecha_creacion: string;     // ISO
  fecha_actualizacion: string; // ISO
}

export interface ReservaCreateRequest {
  id_usuario: number | string;
  id_cancha: number | string;
  inicio: string; // ISO
  fin: string;    // ISO
  notas?: string | null;
}

export interface ReservaUpdateRequest {
  inicio?: string; // ISO
  fin?: string;    // ISO
  notas?: string | null;
}

export interface DisponibilidadQuery {
  id_cancha: number | string;
  fecha?: string; // ISO date (YYYY-MM-DD) opcional
  desde?: string; // ISO datetime opcional
  hasta?: string; // ISO datetime opcional
}

export interface SlotDisponible {
  inicio: string; // ISO datetime
  fin: string;    // ISO datetime
  duracion_minutos: number;
}
