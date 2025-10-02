import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { 
  ListUploads, 
  GetUpload, 
  ProcessUpload, 
  UpdateUpload, 
  DeleteUpload,
  GetUploadsByUsuario,
  GetUploadsByEntidad,
  MarkAsProcessed,
  GetUploadStats,
  CleanupExpiredUploads
} from "../../application/UploadsUseCases";

/**
 * Controlador para operaciones de uploads.
 * Maneja las peticiones HTTP para gestión de archivos subidos.
 */
export class UploadsController {
  constructor(
    private listUploadsUC: ListUploads,
    private getUploadUC: GetUpload,
    private processUploadUC: ProcessUpload,
    private updateUploadUC: UpdateUpload,
    private deleteUploadUC: DeleteUpload,
    private getUploadsByUsuarioUC: GetUploadsByUsuario,
    private getUploadsByEntidadUC: GetUploadsByEntidad,
    private markAsProcessedUC: MarkAsProcessed,
    private getUploadStatsUC: GetUploadStats,
    private cleanupExpiredUploadsUC: CleanupExpiredUploads
  ) {}

  /**
   * Lista uploads con paginación y filtros.
   * GET /uploads
   */
  list = async (req: Request, res: Response) => {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        usuarioId: req.query.usuarioId ? Number(req.query.usuarioId) : undefined,
        tipo: req.query.tipo as any,
        categoria: req.query.categoria as any,
        estado: req.query.estado as any,
        entidadId: req.query.entidadId ? Number(req.query.entidadId) : undefined,
        tipoEntidad: req.query.tipoEntidad as string | undefined,
        fechaDesde: req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined,
        fechaHasta: req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined,
        q: req.query.q as string | undefined,
      };
      
      const result = await this.listUploadsUC.execute(filters);
      res.json(ok(result));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene un upload específico.
   * GET /uploads/:id
   */
  get = async (req: Request, res: Response) => {
    try {
      const upload = await this.getUploadUC.execute(Number(req.params.id));
      res.json(ok(upload));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Procesa un nuevo archivo subido.
   * POST /uploads
   */
  upload = async (req: Request, res: Response) => {
    try {
      // Verificar que se haya subido un archivo usando type assertion
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json(fail(400, "No se ha subido ningún archivo"));
      }

      const { usuarioId, categoria, entidadId, tipoEntidad } = req.body;
      
      // Validar parámetros requeridos
      if (!usuarioId || !categoria) {
        return res.status(400).json(fail(400, "usuarioId y categoria son requeridos"));
      }

      // Validar categoría
      const categoriasValidas = ['avatar', 'cancha', 'complejo', 'reserva', 'verificacion', 'general'];
      if (!categoriasValidas.includes(categoria)) {
        return res.status(400).json(fail(400, `Categoría inválida. Debe ser una de: ${categoriasValidas.join(', ')}`));
      }

      // Procesar el archivo con los datos disponibles
      const fileData = {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
        path: file.path
      };

      const upload = await this.processUploadUC.execute(
        fileData,
        Number(usuarioId),
        categoria,
        entidadId ? Number(entidadId) : undefined,
        tipoEntidad
      );
      
      res.status(201).json(ok(upload));
    } catch (e: any) {
      console.error('Error en upload:', e);
      res.status(e?.statusCode ?? 400).json(fail(
        e?.statusCode ?? 400, 
        e?.message ?? "Error al procesar el archivo", 
        e?.details
      ));
    }
  };

  /**
   * Actualiza metadatos de un upload.
   * PATCH /uploads/:id
   */
  update = async (req: Request, res: Response) => {
    try {
      const upload = await this.updateUploadUC.execute(Number(req.params.id), req.body);
      res.json(ok(upload));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Elimina un upload.
   * DELETE /uploads/:id
   */
  delete = async (req: Request, res: Response) => {
    try {
      await this.deleteUploadUC.execute(Number(req.params.id));
      res.json(ok({ deleted: true }));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene uploads de un usuario específico.
   * GET /uploads/usuario/:usuarioId
   */
  getByUsuario = async (req: Request, res: Response) => {
    try {
      const usuarioId = Number(req.params.usuarioId);
      const categoria = req.query.categoria as any;
      
      const uploads = await this.getUploadsByUsuarioUC.execute(usuarioId, categoria);
      res.json(ok(uploads));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene uploads de una entidad específica.
   * GET /uploads/entidad/:tipoEntidad/:entidadId
   */
  getByEntidad = async (req: Request, res: Response) => {
    try {
      const { tipoEntidad, entidadId } = req.params;
      
      const uploads = await this.getUploadsByEntidadUC.execute(Number(entidadId), tipoEntidad);
      res.json(ok(uploads));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Marca un upload como procesado.
   * POST /uploads/:id/processed
   */
  markProcessed = async (req: Request, res: Response) => {
    try {
      const { url, thumbnailUrl, metadatos } = req.body;
      
      if (!url) {
        return res.status(400).json(fail(400, "URL es requerida"));
      }
      
      const upload = await this.markAsProcessedUC.execute(
        Number(req.params.id),
        url,
        thumbnailUrl,
        metadatos
      );
      
      res.json(ok(upload));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene estadísticas de uploads.
   * GET /uploads/stats
   */
  getStats = async (req: Request, res: Response) => {
    try {
      const usuarioId = req.query.usuarioId ? Number(req.query.usuarioId) : undefined;
      const stats = await this.getUploadStatsUC.execute(usuarioId);
      res.json(ok(stats));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Limpia uploads expirados.
   * POST /uploads/cleanup
   */
  cleanup = async (req: Request, res: Response) => {
    try {
      const cleaned = await this.cleanupExpiredUploadsUC.execute();
      res.json(ok({ archivosLimpiados: cleaned }));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };
}
