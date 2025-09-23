import { AdminRepository } from "../domain/AdminRepository";
import { SetRolIn, UsuarioOut } from "./dtos";

/**
 * Caso de uso para asignar roles a usuarios.
 * Maneja la lógica de negocio para cambiar el rol de un usuario específico.
 */
export class AsignarRol {
  constructor(private repo: AdminRepository) {}

  /**
   * Asigna un nuevo rol a un usuario.
   * @param userId - ID del usuario al que se le asignará el rol
   * @param input - Datos del rol a asignar
   * @returns Promise con el usuario actualizado y mensaje de confirmación
   * @throws Error si el usuario no existe o el rol es inválido
   */
  async execute(userId: number, input: SetRolIn): Promise<UsuarioOut> {
    const u = await this.repo.asignarRol(userId, input.rol);
    return { ...u, message: `Rol actualizado a ${u.rol}` };
  }
}
