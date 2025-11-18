import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { 
  ListResenas,
  GetResena,
  CreateResena, 
  UpdateResena, 
  DeleteResena,
  ReportarResena
} from "../../application/ResenasUseCases";

/**
 * Controlador para operaciones de reseñas.
 * Basado en la API FastAPI de Taller4.
 * Maneja las peticiones HTTP para gestión de reseñas.
 */
export class ResenasController {
  constructor(
    private listResenasUC: ListResenas,
    private getResenaUC: GetResena,
    private createResenaUC: CreateResena,
    private updateResenaUC: UpdateResena,
    private deleteResenaUC: DeleteResena,
    private reportarResenaUC: ReportarResena
  ) {}

  /**
   * Lista reseñas con filtros opcionales (por cancha o complejo).
   * GET /resenas
   * Query params: id_cancha, id_complejo, order, page, page_size
   */
  list = async (req: Request, res: Response) => {
    try {
      // Aceptar tanto camelCase como snake_case para compatibilidad
      const idCancha = req.query.idCancha || req.query.id_cancha;
      const idComplejo = req.query.idComplejo || req.query.id_complejo;
      const pageSize = req.query.pageSize || req.query.page_size;
      
      const filters = {
        idCancha: idCancha ? Number(idCancha) : undefined,
        idComplejo: idComplejo ? Number(idComplejo) : undefined,
        order: req.query.order as any,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      };
      
      console.log('🔍 [ResenasController.list] Query params recibidos:', req.query);
      console.log('📋 [ResenasController.list] Filtros procesados:', filters);
      
      const result = await this.listResenasUC.execute(filters);
      res.json(ok(result));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene una reseña específica por ID.
   * GET /resenas/:id
   */
  getOne = async (req: Request, res: Response) => {
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
      // Convertir snake_case a camelCase para compatibilidad
      const input = {
        idCancha: req.body.id_cancha || req.body.idCancha,
        idComplejo: req.body.id_complejo || req.body.idComplejo,
        calificacion: req.body.calificacion,
        comentario: req.body.comentario
      };
      
      console.log('📝 [ResenasController.create] Body recibido:', req.body);
      console.log('📝 [ResenasController.create] Input procesado:', input);
      
      const resena = await this.createResenaUC.execute(input);
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
   * Elimina una reseña (permisos: autor, admin/dueno, superadmin).
   * DELETE /resenas/:id
   */
  delete = async (req: Request, res: Response) => {
    try {
      await this.deleteResenaUC.execute(Number(req.params.id));
      res.status(204).send();
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Reporta una reseña por contenido inapropiado.
   * POST /resenas/:id/reportar
   * Body: { motivo?: string }
   */
  reportar = async (req: Request, res: Response) => {
    try {
      const { motivo } = req.body;
      
      const result = await this.reportarResenaUC.execute(Number(req.params.id), motivo);
      res.status(201).json(ok(result));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };
}
