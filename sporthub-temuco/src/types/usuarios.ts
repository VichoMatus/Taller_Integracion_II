export type UsuarioRol = "admin" | "usuario" | "super_admin";

export interface Usuario {
  id_usuario: number | string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  contrasena_hash: string | null;
  rol: UsuarioRol;
  esta_activo: boolean;
  verificado: boolean;
  avatar_url: string | null;
  google_id: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface UsuarioCreateRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  rol?: UsuarioRol;
  esta_activo?: boolean;
  verificado?: boolean;
  avatar_url?: string | null;
  google_id?: string | null;
  contrasena?: string;
  contrasena_hash?: string;
}

export interface UsuarioUpdateRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string | null;
  rol?: UsuarioRol;
  esta_activo?: boolean;
  verificado?: boolean;
  avatar_url?: string | null;
  google_id?: string | null;
  contrasena?: string;
  contrasena_hash?: string;
}

export interface UsuarioListQuery {
  q?: string;
  rol?: UsuarioRol;
  esta_activo?: boolean;
  verificado?: boolean;
  page?: number;
  size?: number;
}

// Nueva interfaz para el display en frontend
export interface UserDisplay {
  id: string;
  name: string;
  email: string;
  type: 'Regular' | 'Premium';
  status: 'Activo' | 'Inactivo' | 'Por revisar';
  lastAccess: string;
  rol: UsuarioRol;
  verificado: boolean;
  esta_activo: boolean;
}