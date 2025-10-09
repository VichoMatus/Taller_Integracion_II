// src/grupos/type/gruposTypes.ts

export type GrupoEstado = "ACTIVO" | "INACTIVO";
export type RolEnGrupo = "OWNER" | "ADMIN" | "MIEMBRO";

export interface Grupo {
  id_grupo: number | string;
  nombre: string;
  descripcion?: string | null;
  estado: GrupoEstado;

  id_owner: number | string;   // usuario que es dueño del grupo
  total_miembros: number;

  fecha_creacion: string;       // ISO
  fecha_actualizacion: string;  // ISO
}

export interface GrupoCreate {
  nombre: string;
  descripcion?: string | null;
  id_owner: number | string;
  estado?: GrupoEstado; // por defecto "ACTIVO"
}

export interface GrupoUpdate {
  nombre?: string;
  descripcion?: string | null;
  estado?: GrupoEstado;
}

export interface GrupoListQuery {
  q?: string;                    // búsqueda por nombre/desc
  id_owner?: number | string;
  estado?: GrupoEstado;
  page?: number;
  size?: number;
}

export interface GrupoMiembro {
  id_miembro: number | string;
  id_grupo: number | string;
  id_usuario: number | string;
  rol: RolEnGrupo;
  fecha_creacion: string;       // ISO
}

export interface AddMiembroRequest {
  id_usuario: number | string;
  rol?: RolEnGrupo; // por defecto "MIEMBRO"
}

export interface UpdateMiembroRequest {
  rol: RolEnGrupo;
}

export interface TransferOwnerRequest {
  id_nuevo_owner: number | string;
}
