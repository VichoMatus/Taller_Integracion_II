/**
 * Roles disponibles en el sistema con jerarquía de permisos.
 * 
 * - usuario: Usuario básico del sistema
 * - dueno: Propietario de establecimiento
 * - admin: Administrador con permisos de gestión
 * - superadmin: Administrador con permisos completos
 */
export type Rol = "usuario" | "dueno" | "admin" | "superadmin";

/**
 * Entidad principal de usuario del sistema.
 * Representa un usuario con sus datos personales y configuración.
 */
export interface User {
  /** Identificador único del usuario */
  id: number;
  /** Email del usuario (único en el sistema) */
  email: string;
  /** Rol que determina los permisos del usuario */
  rol: Rol;
  /** Nombre del usuario (opcional) */
  nombre?: string;
  /** Apellido del usuario (opcional) */
  apellido?: string;
  /** Número de teléfono (opcional) */
  telefono?: string;
  /** Indica si el usuario está activo en el sistema */
  activo: boolean;
  /** Indica si el email del usuario ha sido verificado */
  verificado: boolean;
  /** URL del avatar del usuario (opcional) */
  avatarUrl?: string;
}
