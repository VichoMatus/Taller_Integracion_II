import { Router } from "express";
import multer from "multer";
import { CanchaFotosController } from "../controllers/CanchaFotosController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { requireRole } from "../../../admin/presentation/guards/guards";

/**
 * Configuración de multer para subida de imágenes
 */
const storage = multer.memoryStorage();

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo (igual que cloudflare)
    files: 10, // Máximo 10 archivos por request
  },
  fileFilter: (req, file, cb) => {
    // Filtros de seguridad para imágenes
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
      const error = new Error('Solo se permiten archivos de imagen (JPEG, PNG, WebP, GIF)') as any;
      cb(error, false);
    }
  }
});

/**
 * Middleware para manejar errores de multer
 */
const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        ok: false, 
        error: { message: 'Archivo demasiado grande. Máximo 50MB.' }
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        ok: false, 
        error: { message: 'Demasiados archivos. Máximo 10 archivos por vez.' }
      });
    }
  }
  
  if (error.message && error.message.includes('Solo se permiten archivos de imagen')) {
    return res.status(400).json({ 
      ok: false, 
      error: { message: error.message }
    });
  }
  
  next(error);
};

const router = Router();
const controller = new CanchaFotosController();

// === RUTAS PÚBLICAS ===

/**
 * GET /canchas/:id/fotos
 * Obtiene las fotos de una cancha (público)
 */
router.get("/:id/fotos", (req, res) => controller.obtenerFotos(req, res));

// === RUTAS PRIVADAS (REQUIEREN AUTENTICACIÓN) ===

/**
 * POST /canchas/:id/fotos/upload
 * Sube una sola foto para una cancha
 * Requiere autenticación y rol admin/super_admin
 */
router.post(
  "/:id/fotos/upload", 
  authMiddleware, 
  requireRole("admin", "super_admin"),
  uploadMiddleware.single('image'),
  handleUploadError,
  (req, res) => controller.subirFoto(req, res)
);

/**
 * POST /canchas/:id/fotos/upload-multiple
 * Sube múltiples fotos para una cancha
 * Requiere autenticación y rol admin/super_admin
 */
router.post(
  "/:id/fotos/upload-multiple",
  authMiddleware,
  requireRole("admin", "super_admin"), 
  uploadMiddleware.array('images', 10), // Máximo 10 imágenes
  handleUploadError,
  (req, res) => controller.subirMultiplesFotos(req, res)
);

/**
 * DELETE /canchas/:id/fotos/:fotoId
 * Elimina una foto de cancha
 * Requiere autenticación y rol admin/super_admin
 */
router.delete(
  "/:id/fotos/:fotoId",
  authMiddleware,
  requireRole("admin", "super_admin"),
  (req, res) => controller.eliminarFoto(req, res)
);

export default router;