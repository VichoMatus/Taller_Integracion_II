import { Usuario } from "../../usuario/types/usuarioTypes";
import { CambioRolRequest } from "../types/cambioRolTypes";
import { ENV } from "../../config/env";
import { buildHttpClient } from "../../infra/http/client";

/**
 * Servicio BFF para cambio de rol de usuarios.
 *
 * Encapsula las llamadas a la API administrativa que permiten
 * promocionar o degradar el rol de un usuario. Utiliza el cliente
 * HTTP configurado del proyecto con baseURL y autenticación automática.
 */
export const cambioRolService = {
  /**
   * Promociona a un usuario a un rol superior (admin o super_admin).
   * @param id_usuario - ID del usuario a promover
   * @param payload - Datos del nuevo rol
   * @param token - Token de autenticación del super_admin
   */
  async promover(id_usuario: string | number, payload: CambioRolRequest, token: string): Promise<Usuario> {
    const httpClient = buildHttpClient(ENV.FASTAPI_URL, () => `${token}`);
    
    const { data } = await httpClient.post<Usuario>(
      `/admin/usuarios/${id_usuario}/rol`,
      payload
    );
    return data;
  },

  /**
   * Degrada a un usuario a un rol inferior (admin o usuario).
   * @param id_usuario - ID del usuario a degradar
   * @param payload - Datos del nuevo rol
   * @param token - Token de autenticación del super_admin
   */
  async degradar(id_usuario: string | number, payload: CambioRolRequest, token: string): Promise<Usuario> {
    const httpClient = buildHttpClient(ENV.FASTAPI_URL, () => `${token}`);
    
    const { data } = await httpClient.post<Usuario>(
      `/admin/usuarios/${id_usuario}/rol/demote`,
      payload
    );
    return data;
  },
};
