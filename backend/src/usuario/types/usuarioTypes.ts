// src/usuario/type/usuarioTypes.ts

export type UsuarioRol = "admin" | "usuario" | "super_admin";

export interface Usuario {
  id_usuario: number | string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  contrasena_hash: string | null;  // El backend no debería devolver el hash; lo dejo nullable por compat.
  rol: UsuarioRol;
  esta_activo: boolean;
  verificado: boolean;
  avatar_url: string | null;
  google_id: string | null;
  fecha_creacion: string;       // ISO
  fecha_actualizacion: string;  // ISO
}

/**
 * Para crear: normalmente envías `contrasena` en texto plano y el backend la hashea.
 * Si tu backend exige `contrasena_hash`, puedes enviar ese campo en su lugar.
 */
export interface UsuarioCreateRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  rol?: UsuarioRol;
  esta_activo?: boolean; // por defecto true en backend
  verificado?: boolean;  // por defecto false en backend
  avatar_url?: string | null;
  google_id?: string | null;

  // uno de estos dos, según tu backend:
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

  // cambios de contraseña
  contrasena?: string;
  contrasena_hash?: string;
}

export interface UsuarioListQuery {
  q?: string; // búsqueda libre por nombre/email
  rol?: UsuarioRol;
  esta_activo?: boolean;
  verificado?: boolean;
  page?: number;
  size?: number;
}

/**
 * Información pública de contacto de un usuario
 * Accesible sin permisos especiales (solo requiere autenticación básica)
 */
export interface UsuarioContactoPublico {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
}
