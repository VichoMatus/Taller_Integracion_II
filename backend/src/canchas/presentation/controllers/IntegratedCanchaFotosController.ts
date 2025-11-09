import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { CanchaFotosService } from "../../application/CanchaFotosService";
import { getBearerFromReq } from "../../../interfaces/auth";

/**
 * Controlador integrado para gestión de fotos de canchas
 * Procesa imágenes con Cloudflare y registra en FastAPI
 */
export class IntegratedCanchaFotosController {
  /**
   * Endpoint integrado para subir fotos de canchas
   * POST /api/canchas/:id/upload-fotos
   * 
   * Este endpoint:
   * 1. Recibe las imágenes via multer
   * 2. Las procesa y sube a Cloudflare R2 (usando el servicio existente)
   * 3. Registra la información en FastAPI
   * 4. Retorna la respuesta completa
   */
  async uploadFotosIntegrado(req: Request, res: Response) {
    try {
      const canchaId = parseInt(req.params.id);
      const files = (req as any).files || [(req as any).file];
      
      if (!files || files.length === 0) {
        return res.status(400).json(fail(400, "No se recibieron archivos"));
      }

      if (!canchaId || isNaN(canchaId)) {
        return res.status(400).json(fail(400, "ID de cancha inválido"));
      }

      // Obtener token de autenticación
      const authToken = getBearerFromReq(req);
      
      // Crear servicio
      const fotosService = new CanchaFotosService(authToken);
      
      const resultados = [];
      let exitosos = 0;
      let fallidos = 0;

      // Procesar cada archivo
      for (const file of files) {
        try {
          console.log(`📤 Procesando ${file.originalname} para cancha ${canchaId}`);
          
          const resultado = await fotosService.subirFotoCancha(
            canchaId,
            file.buffer,
            file.originalname,
            req.body.descripcion
          );

          if (resultado.success) {
            resultados.push({
              originalName: file.originalname,
              success: true,
              data: resultado.data
            });
            exitosos++;
          } else {
            resultados.push({
              originalName: file.originalname,
              success: false,
              error: resultado.error
            });
            fallidos++;
          }
        } catch (error: any) {
          resultados.push({
            originalName: file.originalname,
            success: false,
            error: {
              message: error.message || 'Error desconocido',
              details: null
            }
          });
          fallidos++;
        }
      }

      console.log(`✅ Completado: ${exitosos} exitosos, ${fallidos} fallidos`);

      // Retornar resultado consolidado
      const response = {
        total: files.length,
        exitosos,
        fallidos,
        resultados
      };

      if (exitosos > 0) {
        return res.status(201).json(ok(response));
      } else {
        return res.status(400).json(fail(400, "No se pudo subir ninguna imagen", response));
      }
    } catch (error: any) {
      console.error('❌ Error en uploadFotosIntegrado:', error);
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }

  /**
   * Endpoint para obtener fotos de cancha (proxy a FastAPI)
   * GET /api/canchas/:id/fotos-list
   */
  async listarFotos(req: Request, res: Response) {
    try {
      const canchaId = parseInt(req.params.id);
      
      if (!canchaId || isNaN(canchaId)) {
        return res.status(400).json(fail(400, "ID de cancha inválido"));
      }

      const fotosService = new CanchaFotosService();
      const resultado = await fotosService.obtenerFotosCancha(canchaId);

      if (resultado.success) {
        return res.json(ok(resultado.data));
      } else {
        return res.status(400).json(fail(400, resultado.error.message, resultado.error.details));
      }
    } catch (error: any) {
      console.error('❌ Error en listarFotos:', error);
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }

  /**
   * Endpoint para eliminar foto de cancha
   * DELETE /api/canchas/:id/fotos-delete/:fotoId
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

      const authToken = getBearerFromReq(req);
      const fotosService = new CanchaFotosService(authToken);
      
      const resultado = await fotosService.eliminarFotoCancha(canchaId, fotoId);

      if (resultado.success) {
        return res.json(ok({ message: resultado.message }));
      } else {
        return res.status(400).json(fail(400, resultado.error.message, resultado.error.details));
      }
    } catch (error: any) {
      console.error('❌ Error en eliminarFoto:', error);
      return res.status(500).json(fail(500, "Error interno del servidor", error.message));
    }
  }
}