import { apiBackend } from "../config/backend";
import { handleApiError } from "./ApiError";
import { CanchaAdmin, CanchasAdminListQuery } from "../types/canchaAdmin";

/**
 * Servicio para consumir la lista de canchas administradas desde el frontend.
 *
 * Este servicio envuelve las llamadas HTTP al BFF que expone la ruta
 * `/api/canchas/admin`. Utiliza la instancia preconfigurada `apiBackend`
 * para realizar las solicitudes y aplica `handleApiError` para
 * normalizar cualquier excepción proveniente del servidor.
 */
export const canchasAdminService = {
  /**
   * Recupera las canchas disponibles en el panel del administrador.
   *
   * @param params Opcionales: filtros, paginación y orden.
   * @returns Una lista de canchas con sus datos administrables.
   */
  async listar(params?: CanchasAdminListQuery): Promise<CanchaAdmin[]> {
    try {
      const response = await apiBackend.get<CanchaAdmin[]>(
        "/api/canchas/admin",
        { params }
      );
      return response.data;
    } catch (err: any) {
      handleApiError(err);
    }
  },
};
