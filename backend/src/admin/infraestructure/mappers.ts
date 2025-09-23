import { User } from "../../domain/user/User";

/**
 * Tipo que representa la estructura de usuario en FastAPI.
 * Utiliza convención snake_case como es estándar en Python.
 */
export type FastUser = {
  id_usuario: number;
  email: string;
  rol: User["rol"];
  nombre?: string;
  apellido?: string;
  telefono?: string;
  esta_activo: boolean;
  verificado: boolean;
  avatar_url?: string;
};

/**
 * Convierte usuario de formato FastAPI (snake_case) a formato del dominio (camelCase).
 *
 * @param r - Usuario en formato FastAPI
 * @returns Usuario en formato del dominio
 */
export const toUser = (r: FastUser): User => ({
  id: r.id_usuario,
  email: r.email,
  rol: r.rol,
  nombre: r.nombre,
  apellido: r.apellido,
  telefono: r.telefono,
  activo: r.esta_activo,
  verificado: r.verificado,
  avatarUrl: r.avatar_url,
});
