import { Router } from "express";
import multer from "multer";
import { IntegratedCanchaFotosController } from "../controllers/IntegratedCanchaFotosController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { requireRole } from "../../../admin/presentation/guards/guards";

/**
 * Rutas integradas para gestión completa de fotos de canchas
 * Conecta Cloudflare R2 + FastAPI de forma transparente
 */

// Configuración de multer para imágenes
const storage = multer.memoryStorage();
const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB como en cloudflare
    files: 10, // Máximo 10 archivos
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, WebP, GIF)'), false);
    }
  }
});

const router = Router();
const controller = new IntegratedCanchaFotosController();

/**
 * GET /canchas/:id/fotos-list
 * Lista fotos de una cancha (público)
 */
router.get("/:id/fotos-list", (req: any, res: any) => {
  controller.listarFotos(req, res);
});

/**
 * POST /canchas/:id/upload-fotos
 * Endpoint integrado para subir fotos
 * - Procesa con Cloudflare
 * - Registra en FastAPI  
 * - Requiere autenticación admin
 */
router.post("/:id/upload-fotos", 
  authMiddleware,
  requireRole("admin", "super_admin"),
  uploadMiddleware.array('images', 10),
  (req: any, res: any) => {
    controller.uploadFotosIntegrado(req, res);
  }
);

/**
 * POST /canchas/:id/upload-foto-single  
 * Sube una sola foto (alternativa)
 */
router.post("/:id/upload-foto-single",
  authMiddleware,
  requireRole("admin", "super_admin"), 
  uploadMiddleware.single('image'),
  (req: any, res: any) => {
    controller.uploadFotosIntegrado(req, res);
  }
);

/**
 * DELETE /canchas/:id/fotos-delete/:fotoId
 * Elimina una foto de cancha
 * Requiere autenticación admin
 */
router.delete("/:id/fotos-delete/:fotoId",
  authMiddleware,
  requireRole("admin", "super_admin"),
  (req: any, res: any) => {
    controller.eliminarFoto(req, res);
  }
);

export default router;