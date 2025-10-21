import { Request, Response } from 'express';
import { CanchasAdminListQuery } from '../../types/canchaAdminTypes';
import { canchasAdminService } from '../../services/canchaAdminServices';

/**
 * Controlador para la consulta de canchas disponibles en el panel de administración.
 *
 * Este controlador parsea los parámetros de consulta recibidos a través de
 * Express, invoca al servicio BFF y gestiona las respuestas y errores
 * devolviendo códigos HTTP apropiados al cliente.
 */
export class CanchasAdminController {
  /**
   * Maneja la recuperación de canchas administradas.
   *
   * Acepta parámetros opcionales de filtrado, paginación y orden desde
   * `req.query` y los transforma al tipo adecuado antes de llamar
   * al servicio. Cualquier error es capturado y devuelto con un
   * código de estado adecuado.
   */
  async listar(req: Request, res: Response): Promise<Response> {
    // Construir un objeto de parámetros a partir de la query string
    const query: CanchasAdminListQuery = {
      id_complejo: req.query.id_complejo as string,
      q: req.query.q as string,
      incluir_inactivas: typeof req.query.incluir_inactivas !== 'undefined'
        ? req.query.incluir_inactivas === 'true'
        : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      page_size: req.query.page_size ? Number(req.query.page_size) : undefined,
      sort_by: req.query.sort_by as any,
      order: req.query.order as any,
    };
    try {
      const canchas = await canchasAdminService.listar(query);
      return res.json(canchas);
    } catch (err: any) {
      // En caso de error, intenta obtener el código de estado desde el error o su respuesta.
      return res.status(err?.status || err?.response?.status || 500).json({
        error:
          err?.message ||
          err?.response?.data?.error ||
          'Error al obtener la lista de canchas',
      });
    }
  }
}
