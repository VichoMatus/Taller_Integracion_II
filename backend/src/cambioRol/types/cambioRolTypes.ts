/**
 * Tipos para las operaciones de cambio de rol de usuario.
 */

export type Rol = "usuario" | "admin" | "superadmin";

/**
 * Cuerpo de la solicitud para cambiar el rol de un usuario.
 * Para promocionar: "admin" o "superadmin".
 * Para degradar: "admin" o "usuario".
 */
export interface CambioRolRequest {
  rol: Rol;
}

/**
 * Parámetros de ruta para operaciones de cambio de rol.
 */
export interface CambioRolParams {
  id_usuario: string | number;
}
