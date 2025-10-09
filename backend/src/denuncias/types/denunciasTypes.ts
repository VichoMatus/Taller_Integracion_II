// src/denuncias/type/denunciasTypes.ts

export type DenunciaEstado = "ABIERTA" | "EN_REVISION" | "RESUELTA" | "RECHAZADA";

export interface Denuncia {
  id_denuncia: number | string;
  id_usuario_reporta: number | string;
  id_usuario_denunciado?: number | string | null;
  id_reserva?: number | string | null;
  id_cancha?: number | string | null;
  categoria?: string | null;          // p.ej.: "CONDUCTA", "PAGO", "INSTALACION"
  asunto: string;
  descripcion: string;
  evidencia_urls?: string[] | null;   // enlaces a imágenes/archivos si el backend los guarda
  estado: DenunciaEstado;
  fecha_creacion: string;             // ISO
  fecha_actualizacion: string;        // ISO
}

export interface DenunciaCreate {
  id_usuario_reporta: number | string;
  asunto: string;
  descripcion: string;
  id_usuario_denunciado?: number | string | null;
  id_reserva?: number | string | null;
  id_cancha?: number | string | null;
  categoria?: string | null;
  evidencia_urls?: string[] | null;
}

export interface DenunciaUpdate {
  asunto?: string;
  descripcion?: string;
  categoria?: string | null;
  evidencia_urls?: string[] | null;
  estado?: DenunciaEstado;
}

export interface DenunciaListQuery {
  id_usuario_reporta?: number | string;
  id_usuario_denunciado?: number | string;
  id_reserva?: number | string;
  id_cancha?: number | string;
  estado?: DenunciaEstado;
  categoria?: string;
  desde?: string; // ISO date/datetime
  hasta?: string; // ISO date/datetime
  page?: number;
  size?: number;
}
