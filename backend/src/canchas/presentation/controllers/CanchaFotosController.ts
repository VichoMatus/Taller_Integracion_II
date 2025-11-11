import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { CanchaFotosService } from "../../application/CanchaFotosService";
import { getBearerFromReq } from "../../../interfaces/auth";

/**
 * Controlador para gestión de fotos de canchas
 * Integra subida a Cloudflare R2 y registro en FastAPI
 */
export class CanchaFotosController {
  /**
   * Sube una foto para una cancha
   * POST /canchas/:id/fotos/upload
   */
  async subirFoto(req: Request, res: Response) {
    try {
      const canchaId = parseInt(req.params.id);
      const file = (req as any).file;
      
      if (!file) {
        return res.status(400).json(fail(400, "No se recibió ningún archivo"));
      }

      if (!canchaId || isNaN(canchaId)) {
        return res.status(400).json(fail(400, "ID de cancha inválido"));
      }

      // Obtener token de autenticación
      const authToken = getBearerFromReq(req);
      
      // Crear servicio con token
      const fotosService = new CanchaFotosService(authToken);
      
      // Procesar imagen
      const resultado = await fotosService.subirFotoCancha(
        canchaId,
        file.buffer,
        file.originalname,
        req.body.descripcion
      );

      if (resultado.success) {
        return res.status(201).json(ok(resultado.data));
      } else {
        return res.status(400).json(fail(400, resultado.error.message, resultado.error.details));
      }
    } catch (error: any) {
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }

  /**
   * Sube múltiples fotos para una cancha
   * POST /canchas/:id/fotos/upload-multiple
   */
  async subirMultiplesFotos(req: Request, res: Response) {
    try {
      const canchaId = parseInt(req.params.id);
      const files = (req as any).files;
      
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json(fail(400, "No se recibieron archivos"));
      }

      if (!canchaId || isNaN(canchaId)) {
        return res.status(400).json(fail(400, "ID de cancha inválido"));
      }

      // Obtener token de autenticación
      const authToken = getBearerFromReq(req);
      
      // Crear servicio con token
      const fotosService = new CanchaFotosService(authToken);
      
      // Procesar múltiples imágenes
      const archivos = files.map((file: any) => ({
        buffer: file.buffer,
        originalname: file.originalname,
        descripcion: req.body.descripcion || undefined
      }));

      const resultado = await fotosService.subirMultiplesFotos(canchaId, archivos);

      return res.status(201).json(ok(resultado));
    } catch (error: any) {
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }

  /**
   * Obtiene las fotos de una cancha
   * GET /canchas/:id/fotos
   */
  async obtenerFotos(req: Request, res: Response) {
    try {
      const canchaId = parseInt(req.params.id);
      
      if (!canchaId || isNaN(canchaId)) {
        return res.status(400).json(fail(400, "ID de cancha inválido"));
      }

      // Para obtener fotos no necesitamos autenticación necesariamente
      const fotosService = new CanchaFotosService();
      
      const resultado = await fotosService.obtenerFotosCancha(canchaId);

      if (resultado.success) {
        return res.json(ok(resultado.data));
      } else {
        return res.status(400).json(fail(400, resultado.error.message, resultado.error.details));
      }
    } catch (error: any) {
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }

  /**
   * Elimina una foto de cancha
   * DELETE /canchas/:id/fotos/:fotoId
   */
  async eliminarFoto(req: Request, res: Response) {
    try {
      const canchaId = parseInt(req.params.id);
      const fotoId = parseInt(req.params.fotoId);
      
      if (!canchaId || isNaN(canchaId)) {
        return res.status(400).json(fail(400, "ID de cancha inválido"));
      }

      if (!fotoId || isNaN(fotoId)) {
        return res.status(400).json(fail(400, "ID de foto inválido"));
      }

      // Obtener token de autenticación
      const authToken = getBearerFromReq(req);
      
      // Crear servicio con token
      const fotosService = new CanchaFotosService(authToken);
      
      const resultado = await fotosService.eliminarFotoCancha(canchaId, fotoId);

      if (resultado.success) {
        return res.json(ok({ message: resultado.message }));
      } else {
        return res.status(400).json(fail(400, resultado.error.message, resultado.error.details));
      }
    } catch (error: any) {
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }
}