// src/types/grupos.ts
export interface Grupo {
  id_grupo: string | number;
  nombre: string;
  descripcion: string | null;
  id_creador: string | number;
  miembros: Array<{ id_usuario: string | number; rol: "ADMIN" | "MIEMBRO" }>;
  fecha_creacion: string;       // ISO
  fecha_actualizacion: string;  // ISO
}

export interface GrupoCreate {
  nombre: string;
  descripcion?: string | null;
  id_creador: string | number;
  miembros?: Array<{ id_usuario: string | number; rol?: "ADMIN" | "MIEMBRO" }>;
}

export interface GrupoUpdate {
  nombre?: string;
  descripcion?: string | null;
}

export interface GrupoListQuery {
  q?: string;
  id_usuario?: string | number; // listar donde participa el usuario
  page?: number;
  size?: number;
}
