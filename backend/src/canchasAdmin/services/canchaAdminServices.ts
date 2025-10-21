import axios from 'axios';
import { CanchasAdminListQuery, CanchaAdmin } from '../types/canchaAdminTypes';

/**
 * Servicio BFF para la consulta de canchas en el panel de administración.
 *
 * Este servicio encapsula la llamada al endpoint remoto
 * `/api/v1/canchas/admin`, permitiendo filtrar, paginar y ordenar
 * las canchas disponibles según los parámetros recibidos. No utiliza
 * `apiBackend` ni un manejador de errores global, delegando la
 * responsabilidad de manejar excepciones al controlador que lo invoque.
 */
export const canchasAdminService = {
  /**
   * Obtiene la lista de canchas para el panel del administrador.
   *
   * @param params Parámetros opcionales de filtrado, paginación y orden.
   * @returns Un arreglo de canchas con la información administrable.
   */
  async listar(params?: CanchasAdminListQuery): Promise<CanchaAdmin[]> {
    const { data } = await axios.get<CanchaAdmin[]>(
      '/api/v1/canchas/admin',
      { params }
    );
    return data;
  },
};
