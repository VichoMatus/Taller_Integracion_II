import { AdminRepository } from "../domain/AdminRepository";
import { Rol, User } from "../../domain/user/User";
import { Paginated } from "../../app/common/pagination";

/**
 * Caso de uso para listar usuarios con paginación y filtros.
 */
export class ListUsers {
  constructor(private repo: AdminRepository) {}
  
  /**
   * Obtiene una lista paginada de usuarios.
   * @param p - Parámetros de consulta (página, tamaño, búsqueda, rol)
   * @returns Promise con resultado paginado
   */
  execute(p: { page?: number; pageSize?: number; q?: string; rol?: Rol }): Promise<Paginated<User>> {
    return this.repo.listUsers(p);
  }
}

/**
 * Caso de uso para obtener un usuario específico.
 */
export class GetUser {
  constructor(private repo: AdminRepository) {}
  
  /**
   * Obtiene un usuario por su ID.
   * @param id - ID del usuario
   * @returns Promise con los datos del usuario
   */
  execute(id: number): Promise<User> { return this.repo.getUser(id); }
}

/**
 * Caso de uso para actualizar datos de un usuario.
 */
export class PatchUser {
  constructor(private repo: AdminRepository) {}
  
  /**
   * Actualiza parcialmente un usuario.
   * @param id - ID del usuario
   * @param input - Datos a actualizar
   * @returns Promise con el usuario actualizado
   */
  execute(id: number, input: Partial<Omit<User,"id"|"rol">> & { rol?: Rol }): Promise<User> {
    return this.repo.patchUser(id, input);
  }
}

/**
 * Caso de uso para eliminar un usuario.
 */
export class RemoveUser {
  constructor(private repo: AdminRepository) {}
  
  /**
   * Elimina un usuario del sistema.
   * @param id - ID del usuario a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  execute(id: number): Promise<void> { return this.repo.removeUser(id); }
}
