import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { CanchaImageService } from "../../application/CanchaImageService";

/**
 * Controlador para obtener imágenes de canchas desde Cloudflare
 * Integra FastAPI (metadatos) + Cloudflare (imágenes)
 */
export class CanchaImageController {
  /**
   * Obtiene todas las fotos de una cancha
   * GET /canchas/:id/images
   */
  async getCanchaPhotos(req: Request, res: Response) {
    try {
      const canchaId = parseInt(req.params.id);
      
      if (!canchaId || isNaN(canchaId)) {
        return res.status(400).json(fail(400, "ID de cancha inválido"));
      }

      const imageService = new CanchaImageService();
      const result = await imageService.getCanchaPhotos(canchaId);

      if (result.success) {
        return res.json(ok(result.data, {
          total: result.total,
          available: result.available,
          unavailable: result.unavailable
        }));
      } else {
        return res.status(400).json(fail(400, result.error.message, result.error.details));
      }
    } catch (error: any) {
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }

  /**
   * Obtiene la imagen principal de una cancha
   * GET /canchas/:id/main-image
   */
  async getMainPhoto(req: Request, res: Response) {
    try {
      const canchaId = parseInt(req.params.id);
      
      if (!canchaId || isNaN(canchaId)) {
        return res.status(400).json(fail(400, "ID de cancha inválido"));
      }

      const imageService = new CanchaImageService();
      const result = await imageService.getCanchaMainPhoto(canchaId);

      if (result.success) {
        return res.json(ok(result.data));
      } else {
        return res.status(404).json(fail(404, result.error));
      }
    } catch (error: any) {
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }

  /**
   * Obtiene imágenes optimizadas para diferentes tamaños
   * GET /canchas/:id/images/optimized
   */
  async getOptimizedPhotos(req: Request, res: Response) {
    try {
      const canchaId = parseInt(req.params.id);
      
      if (!canchaId || isNaN(canchaId)) {
        return res.status(400).json(fail(400, "ID de cancha inválido"));
      }

      // Tamaños predefinidos (se pueden personalizar via query params)
      const sizes = [
        { name: 'thumbnail', width: 150, height: 150, quality: 70 },
        { name: 'small', width: 300, height: 200, quality: 80 },
        { name: 'medium', width: 600, height: 400, quality: 85 },
        { name: 'large', width: 1200, height: 800, quality: 90 }
      ];

      const imageService = new CanchaImageService();
      const result = await imageService.getCanchaPhotosOptimized(canchaId, sizes);

      if (result.success) {
        return res.json(ok(result.data, { total: result.total }));
      } else {
        return res.status(400).json(fail(400, result.error.message));
      }
    } catch (error: any) {
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }

  /**
   * Verifica el estado de las imágenes de una cancha
   * GET /canchas/:id/images/status
   */
  async checkImagesStatus(req: Request, res: Response) {
    try {
      const canchaId = parseInt(req.params.id);
      
      if (!canchaId || isNaN(canchaId)) {
        return res.status(400).json(fail(400, "ID de cancha inválido"));
      }

      const imageService = new CanchaImageService();
      const result = await imageService.checkCanchaImagesStatus(canchaId);

      if (result.success) {
        return res.json(ok(result.data));
      } else {
        return res.status(400).json(fail(400, result.error.message));
      }
    } catch (error: any) {
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }

  /**
   * Proxy directo a una imagen de Cloudflare
   * GET /canchas/image/:filename
   */
  async proxyImage(req: Request, res: Response) {
    try {
      const filename = req.params.filename;
      
      if (!filename) {
        return res.status(400).json(fail(400, "Filename requerido"));
      }

      // Realizar la petición desde el BFF al servicio de imágenes (stream)
      const imageService = new CanchaImageService();
      const retriever = (imageService as any).imageRetriever;

      const uuid = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '');

      // Comprobar metadatos (HEAD) para conocer content-type/size
      const info = await retriever.getImageInfo(uuid);
      if (!info || !info.exists) {
        return res.status(404).json(fail(404, 'Imagen no encontrada'));
      }

      // Obtener stream y enviarlo al cliente
      const stream = await retriever.getImage(uuid, 'stream');
      if (info.contentType) res.setHeader('Content-Type', info.contentType);
      if (info.size) res.setHeader('Content-Length', String(info.size));

      // Pipear el stream directamente
      (stream as any).pipe(res);
      return;
    } catch (error: any) {
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }

  /**
   * Obtiene múltiples imágenes por batch
   * POST /canchas/images/batch
   * Body: { filenames: string[] }
   */
  async getBatchImages(req: Request, res: Response) {
    try {
      const { filenames } = req.body;
      
      if (!Array.isArray(filenames) || filenames.length === 0) {
        return res.status(400).json(fail(400, "Se requiere un array de filenames"));
      }

      if (filenames.length > 50) {
        return res.status(400).json(fail(400, "Máximo 50 imágenes por batch"));
      }

      const imageService = new CanchaImageService();
      const results = await imageService['imageRetriever'].getMultipleImages(filenames);

      const response = {
        total: filenames.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        images: results
      };

      return res.json(ok(response));
    } catch (error: any) {
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }
}