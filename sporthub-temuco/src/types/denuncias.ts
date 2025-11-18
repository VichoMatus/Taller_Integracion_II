// src/types/denuncias.ts

// Tipos que coinciden con el schema SIMPLIFICADO de taller4
export type EstadoDenuncia = "abierta" | "en_revision" | "resuelta" | "rechazada";
export type TipoObjeto = "resena" | "usuario" | "complejo" | "cancha";

export interface Denuncia {
  id_denuncia: number;
  id_reportante: number;
  tipo_objeto: TipoObjeto;
  id_objeto: number;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface DenunciaCreate {
  tipo_objeto: TipoObjeto;
  id_objeto: number;
  titulo: string;
  descripcion?: string | null;
}

export interface DenunciaUpdate {
  estado: EstadoDenuncia;
}

export interface DenunciaListQuery {
  estado?: EstadoDenuncia;
  tipo_objeto?: TipoObjeto;
}

