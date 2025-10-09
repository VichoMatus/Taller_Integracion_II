// src/types/denuncias.ts
export type DenunciaEstado = "ABIERTA" | "EN_REVISION" | "RESUELTA" | "DESCARTADA";

export interface Denuncia {
  id_denuncia: string | number;
  id_usuario: string | number; // denunciante
  id_reserva?: string | number | null;
  id_cancha?: string | number | null;
  motivo: string;        // breve
  descripcion: string;   // detalle
  estado: DenunciaEstado;
  evidencias?: string[]; // URLs de imágenes/archivos
  fecha_creacion: string;
  fecha_actualizacion: string;
  asignado_a?: string | number | null; // id de admin/operador
}

export interface DenunciaCreate {
  id_usuario: string | number;
  motivo: string;
  descripcion: string;
  id_reserva?: string | number | null;
  id_cancha?: string | number | null;
  evidencias?: string[];
}

export interface DenunciaUpdate {
  motivo?: string;
  descripcion?: string;
  estado?: DenunciaEstado;
  evidencias?: string[];
  asignado_a?: string | number | null;
}

export interface DenunciaListQuery {
  id_usuario?: string | number;   // por denunciante
  estado?: DenunciaEstado;
  id_reserva?: string | number;
  id_cancha?: string | number;
  page?: number;
  size?: number;
}
