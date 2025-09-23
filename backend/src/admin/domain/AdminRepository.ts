import { Rol, User } from "../../domain/user/User";
import { Paginated } from "../../app/common/pagination";

/**
 * Repositorio para operaciones administrativas sobre usuarios y roles.
 * Define el contrato para la gestión de usuarios desde la perspectiva de administración.
 */
export interface AdminRepository {
  /**
   * Obtiene una lista paginada de usuarios con filtros opcionales.
   * @param params - Parámetros de consulta
   * @param params.page - Número de página (opcional)
   * @param params.pageSize - Tamaño de página (opcional) 
   * @param params.q - Texto de búsqueda en email, nombre o apellido (opcional)
   * @param params.rol - Filtrar por rol específico (opcional)
   * @returns Promise con resultado paginado de usuarios
   */
  listUsers(params: { page?: number; pageSize?: number; q?: string; rol?: Rol }): Promise<Paginated<User>>;

  /**
   * Obtiene un usuario específico por su ID.
   * @param id - ID del usuario
   * @returns Promise con los datos del usuario
   * @throws Error si el usuario no existe
   */
  getUser(id: number): Promise<User>;

  /**
   * Actualiza parcialmente los datos de un usuario.
   * @param id - ID del usuario a actualizar
   * @param input - Datos a actualizar (parciales)
   * @returns Promise con el usuario actualizado
   * @throws Error si el usuario no existe
   */
  patchUser(id: number, input: Partial<Omit<User, "id" | "rol">> & { rol?: Rol }): Promise<User>;

  /**
   * Elimina un usuario del sistema.
   * @param id - ID del usuario a eliminar
   * @throws Error si el usuario no existe o no se puede eliminar
   */
  removeUser(id: number): Promise<void>;

  /**
   * Asigna un rol específico a un usuario.
   * @param userId - ID del usuario
   * @param rol - Nuevo rol a asignar
   * @returns Promise con el usuario actualizado
   * @throws Error si el usuario no existe o el rol es inválido
   */
  asignarRol(userId: number, rol: Rol): Promise<User>;
}
