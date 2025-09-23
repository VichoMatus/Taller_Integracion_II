import { AxiosInstance } from "axios";
import { AdminRepository } from "../domain/AdminRepository";
import { Rol, User } from "../../domain/user/User";
import { toUser, FastUser } from "./mappers";
import { httpError } from "../../infra/http/errors";
import { Paginated, normalizePage } from "../../app/common/pagination";
import { toSnake } from "../../app/common/case";

/**
 * Implementación del repositorio administrativo utilizando FastAPI como backend.
 * Maneja la comunicación HTTP con el servicio de usuarios y convierte entre formatos.
 */
export class AdminApiRepository implements AdminRepository {
  constructor(private http: AxiosInstance) {}

  /**
   * Lista usuarios desde FastAPI con paginación y filtros.
   * @param p - Parámetros de consulta
   * @returns Promise con usuarios paginados
   */
  async listUsers(p: { page?: number; pageSize?: number; q?: string; rol?: Rol }): Promise<Paginated<User>> {
    try {
      // Usar endpoint real de tu API
      const { data } = await this.http.get(`/api/v1/usuarios`, { params: p });
      return normalizePage<User>(data, x => toUser(x as FastUser));
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene un usuario específico desde FastAPI.
   * @param id - ID del usuario
   * @returns Promise con el usuario encontrado
   */
  async getUser(id: number): Promise<User> {
    try { 
      // Usar endpoint real de tu API
      const { data } = await this.http.get<FastUser>(`/api/v1/usuarios/${id}`); 
      return toUser(data); 
    }
    catch (e) { throw httpError(e); }
  }

  /**
   * Actualiza un usuario en FastAPI.
   * Convierte los datos a snake_case antes de enviar.
   * @param id - ID del usuario
   * @param input - Datos a actualizar
   * @returns Promise con el usuario actualizado
   */
  async patchUser(id: number, input: Partial<Omit<User,"id"|"rol">> & { rol?: Rol }): Promise<User> {
    try {
      // Usar endpoint real de tu API
      const payload = toSnake(input);
      const { data } = await this.http.patch<FastUser>(`/api/v1/usuarios/${id}`, payload);
      return toUser(data);
    } catch (e) { throw httpError(e); }
  }

  /**
   * Elimina un usuario en FastAPI.
   * @param id - ID del usuario a eliminar
   */
  async removeUser(id: number): Promise<void> {
    try { 
      // Usar endpoint real de tu API
      await this.http.delete(`/api/v1/usuarios/${id}`); 
    }
    catch (e) { throw httpError(e); }
  }

  /**
   * Asigna un rol a un usuario mediante FastAPI.
   * Maneja diferentes formatos de respuesta del endpoint.
   * @param userId - ID del usuario
   * @param rol - Rol a asignar
   * @returns Promise con el usuario actualizado
   */
  async asignarRol(userId: number, rol: Rol): Promise<User> {
    try {
      // Usar endpoint real de tu API
      const { data } = await this.http.post<FastUser | { detail: string }>(`/api/v1/admin/usuarios/${userId}/rol`, { rol });
      if ((data as any)?.id_usuario) return toUser(data as FastUser);
      return { id: userId, email: "", rol, activo: true, verificado: true } as User;
    } catch (e) { throw httpError(e); }
  }
}
