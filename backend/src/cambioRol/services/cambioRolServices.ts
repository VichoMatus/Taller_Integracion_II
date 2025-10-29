import axios from "axios";
import { Usuario } from "../../usuario/types/usuarioTypes";
import { CambioRolRequest } from "../types/cambioRolTypes";

/**
 * Servicio BFF para cambio de rol de usuarios.
 *
 * Encapsula las llamadas a la API administrativa que permiten
 * promocionar o degradar el rol de un usuario. En esta versión
 * se utiliza directamente Axios para realizar las solicitudes,
 * sin depender de una instancia configurada (`apiBackend`) ni de
 * un manejador de errores global.
 */
export const cambioRolService = {
  /**
   * Promociona a un usuario a un rol superior (admin o super_admin).
   */
  async promover(id_usuario: string | number, payload: CambioRolRequest): Promise<Usuario> {
    const { data } = await axios.post<Usuario>(
      `/api/v1/admin/usuarios/${id_usuario}/rol`,
      payload
    );
    return data;
  },

  /**
   * Degrada a un usuario a un rol inferior (admin o usuario).
   */
  async degradar(id_usuario: string | number, payload: CambioRolRequest): Promise<Usuario> {
    const { data } = await axios.post<Usuario>(
      `/api/v1/admin/usuarios/${id_usuario}/rol/demote`,
      payload
    );
    return data;
  },
};
