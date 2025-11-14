import { Router } from "express";
import { CanchaImageController } from "../controllers/CanchaImageController";

/**
 * Rutas para obtener imágenes de canchas desde Cloudflare
 * Integra metadatos de FastAPI con imágenes de Cloudflare R2
 */

const router = Router();
const controller = new CanchaImageController();

// === ENDPOINTS PÚBLICOS ===

/**
 * GET /canchas/:id/images
 * Obtiene todas las fotos de una cancha con URLs de Cloudflare
 */
router.get("/:id/images", (req: any, res: any) => {
  controller.getCanchaPhotos(req, res);
});

/**
 * GET /canchas/:id/main-image  
 * Obtiene la imagen principal de una cancha
 */
router.get("/:id/main-image", (req: any, res: any) => {
  controller.getMainPhoto(req, res);
});

/**
 * GET /canchas/:id/images/optimized
 * Obtiene imágenes optimizadas para diferentes tamaños
 * Incluye: thumbnail, small, medium, large
 */
router.get("/:id/images/optimized", (req: any, res: any) => {
  controller.getOptimizedPhotos(req, res);
});

/**
 * GET /canchas/:id/images/status
 * Verifica el estado de disponibilidad de las imágenes
 */
router.get("/:id/images/status", (req: any, res: any) => {
  controller.checkImagesStatus(req, res);
});

/**
 * GET /canchas/image/:filename
 * Proxy directo a una imagen de Cloudflare (redirige)
 */
router.get("/image/:filename", (req: any, res: any) => {
  controller.proxyImage(req, res);
});

/**
 * POST /canchas/images/batch
 * Obtiene múltiples imágenes por batch
 * Body: { filenames: string[] }
 */
router.post("/images/batch", (req: any, res: any) => {
  controller.getBatchImages(req, res);
});

export default router;