import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { 
  ListResenas, 
  GetResena, 
  CreateResena, 
  UpdateResena, 
  DeleteResena,
  GetResenasByUsuario,
  GetResenasByComplejo,
  DarLike,
  QuitarLike,
  ReportarResena,
  GetEstadisticasResenas,
  ResponderResena
} from "../../application/ResenasUseCases";

/**
 * Controlador para operaciones de reseñas.
 * Maneja las peticiones HTTP para gestión de reseñas de complejos deportivos.
 */
export class ResenasController {
  constructor(
    private listResenasUC: ListResenas,
    private getResenaUC: GetResena,
    private createResenaUC: CreateResena,
    private updateResenaUC: UpdateResena,
    private deleteResenaUC: DeleteResena,
    private getResenasByUsuarioUC: GetResenasByUsuario,
    private getResenasByComplejoUC: GetResenasByComplejo,
    private darLikeUC: DarLike,
    private quitarLikeUC: QuitarLike,
    private reportarResenaUC: ReportarResena,
    private getEstadisticasUC: GetEstadisticasResenas,
    private responderResenaUC: ResponderResena
  ) {}

  /**
   * Lista reseñas con paginación y filtros.
   * GET /resenas
   */
  list = async (req: Request, res: Response) => {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        usuarioId: req.query.usuarioId ? Number(req.query.usuarioId) : undefined,
        complejoId: req.query.complejoId ? Number(req.query.complejoId) : undefined,
        calificacionMin: req.query.calificacionMin ? Number(req.query.calificacionMin) : undefined,
        calificacionMax: req.query.calificacionMax ? Number(req.query.calificacionMax) : undefined,
        estado: req.query.estado as any,
        fechaDesde: req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined,
        fechaHasta: req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined,
        soloVerificadas: req.query.soloVerificadas ? req.query.soloVerificadas === 'true' : undefined,
        q: req.query.q as string | undefined,
        ordenFecha: req.query.ordenFecha as any,
      };
      
      const result = await this.listResenasUC.execute(filters);
      res.json(ok(result));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene una reseña específica.
   * GET /resenas/:id
   */
  get = async (req: Request, res: Response) => {
    try {
      const resena = await this.getResenaUC.execute(Number(req.params.id));
      res.json(ok(resena));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Crea una nueva reseña.
   * POST /resenas
   */
  create = async (req: Request, res: Response) => {
    try {
      const resena = await this.createResenaUC.execute(req.body);
      res.status(201).json(ok(resena));
    } catch (e: any) {
      res.status(e?.statusCode ?? 400).json(fail(e?.statusCode ?? 400, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Actualiza una reseña.
   * PATCH /resenas/:id
   */
  update = async (req: Request, res: Response) => {
    try {
      const resena = await this.updateResenaUC.execute(Number(req.params.id), req.body);
      res.json(ok(resena));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Elimina una reseña.
   * DELETE /resenas/:id
   */
  delete = async (req: Request, res: Response) => {
    try {
      await this.deleteResenaUC.execute(Number(req.params.id));
      res.json(ok({ deleted: true }));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene reseñas de un usuario específico.
   * GET /resenas/usuario/:usuarioId
   */
  getByUsuario = async (req: Request, res: Response) => {
    try {
      const usuarioId = Number(req.params.usuarioId);
      const resenas = await this.getResenasByUsuarioUC.execute(usuarioId);
      res.json(ok(resenas));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene reseñas de un complejo específico.
   * GET /resenas/complejo/:complejoId
   */
  getByComplejo = async (req: Request, res: Response) => {
    try {
      const complejoId = Number(req.params.complejoId);
      const incluirOcultas = req.query.incluirOcultas === 'true';
      const resenas = await this.getResenasByComplejoUC.execute(complejoId, incluirOcultas);
      res.json(ok(resenas));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Da like a una reseña.
   * POST /resenas/:id/like
   */
  darLike = async (req: Request, res: Response) => {
    try {
      const { usuarioId } = req.body;
      if (!usuarioId) {
        return res.status(400).json(fail(400, "usuarioId es requerido"));
      }
      
      const resena = await this.darLikeUC.execute(Number(req.params.id), Number(usuarioId));
      res.json(ok(resena));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Quita like de una reseña.
   * DELETE /resenas/:id/like
   */
  quitarLike = async (req: Request, res: Response) => {
    try {
      const { usuarioId } = req.body;
      if (!usuarioId) {
        return res.status(400).json(fail(400, "usuarioId es requerido"));
      }
      
      const resena = await this.quitarLikeUC.execute(Number(req.params.id), Number(usuarioId));
      res.json(ok(resena));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Reporta una reseña.
   * POST /resenas/:id/reportar
   */
  reportar = async (req: Request, res: Response) => {
    try {
      const { usuarioId, motivo } = req.body;
      if (!usuarioId || !motivo) {
        return res.status(400).json(fail(400, "usuarioId y motivo son requeridos"));
      }
      
      await this.reportarResenaUC.execute(Number(req.params.id), Number(usuarioId), motivo);
      res.json(ok({ reportado: true }));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene estadísticas de reseñas de un complejo.
   * GET /resenas/estadisticas/:complejoId
   */
  getEstadisticas = async (req: Request, res: Response) => {
    try {
      const complejoId = Number(req.params.complejoId);
      const estadisticas = await this.getEstadisticasUC.execute(complejoId);
      res.json(ok(estadisticas));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Responde a una reseña.
   * POST /resenas/:id/responder
   */
  responder = async (req: Request, res: Response) => {
    try {
      const { respuesta } = req.body;
      if (!respuesta) {
        return res.status(400).json(fail(400, "respuesta es requerida"));
      }
      
      const resena = await this.responderResenaUC.execute(Number(req.params.id), respuesta);
      res.json(ok(resena));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };
}
