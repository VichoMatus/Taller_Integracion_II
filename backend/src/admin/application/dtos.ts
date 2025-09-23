import { Rol, User } from "../../domain/user/User";

/**
 * DTO para entrada de asignación de rol.
 */
export interface SetRolIn { 
  /** Rol a asignar al usuario */
  rol: Rol 
}

/**
 * DTO de salida para operaciones de usuario con mensaje opcional.
 * Extiende la entidad User con información adicional de respuesta.
 */
export interface UsuarioOut extends User { 
  /** Mensaje informativo sobre la operación realizada */
  message?: string 
}
