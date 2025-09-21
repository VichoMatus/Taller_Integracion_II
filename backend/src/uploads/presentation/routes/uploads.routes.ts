import { Router } from "express";
import multer from "multer";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { fail } from "../../../interfaces/apiEnvelope";
import { UploadApiRepository } from "../../infrastructure/UploadApiRepository";
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
import { UploadsController } from "../controllers/uploads.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";

/**
 * Configuración de multer para manejo de archivos.
 */
const storage = multer.memoryStorage();

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB máximo
    files: 1, // Solo un archivo por request
  },
  fileFilter: (req, file, cb) => {
    // Filtros básicos de seguridad
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png', 
      'image/webp',
      'image/gif',
      'application/pdf',
      'video/mp4',
      'video/avi'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error('Tipo de archivo no permitido') as any;
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
      return res.status(400).json(fail(400, 'Archivo demasiado grande. Máximo 20MB.'));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(fail(400, 'Solo se permite un archivo por vez.'));
    }
  }
  
  if (error.message === 'Tipo de archivo no permitido') {
    return res.status(400).json(fail(400, 'Tipo de archivo no permitido.'));
  }
  
  next(error);
};

/**
 * Router para endpoints de uploads.
 * Maneja la gestión completa de archivos subidos.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new UploadApiRepository(http);
  return new UploadsController(
    new ListUploads(repo),
    new GetUpload(repo),
    new ProcessUpload(repo),
    new UpdateUpload(repo),
    new DeleteUpload(repo),
    new GetUploadsByUsuario(repo),
    new GetUploadsByEntidad(repo),
    new MarkAsProcessed(repo),
    new GetUploadStats(repo),
    new CleanupExpiredUploads(repo)
  );
};

// === Endpoints Públicos ===

/** GET /uploads/entidad/:tipoEntidad/:entidadId - Obtiene uploads de una entidad (público) */
router.get("/entidad/:tipoEntidad/:entidadId", (req, res) => ctrl(req).getByEntidad(req, res));

/** GET /uploads/:id - Obtiene upload específico (público para lectura) */
router.get("/:id", (req, res) => ctrl(req).get(req, res));

// === Endpoints de Usuario Autenticado ===
// Requieren autenticación para subir y gestionar archivos

/** POST /uploads - Sube un nuevo archivo */
router.post("/", 
  uploadMiddleware.single('file'),
  (req, res) => ctrl(req).upload(req, res)
);

/** GET /uploads/usuario/:usuarioId - Obtiene uploads de un usuario */
router.get("/usuario/:usuarioId", (req, res) => ctrl(req).getByUsuario(req, res));

/** PATCH /uploads/:id - Actualiza metadatos de upload (solo el propietario) */
router.patch("/:id", (req, res) => ctrl(req).update(req, res));

/** DELETE /uploads/:id - Elimina upload (solo el propietario) */
router.delete("/:id", (req, res) => ctrl(req).delete(req, res));

/** POST /uploads/:id/processed - Marca upload como procesado (interno) */
router.post("/:id/processed", (req, res) => ctrl(req).markProcessed(req, res));

// === Endpoints Administrativos ===
// Requieren rol admin o superadmin

/** GET /uploads - Lista todos los uploads con filtros */
router.get("/", requireRole("admin", "superadmin"), (req, res) => ctrl(req).list(req, res));

/** GET /uploads/stats - Obtiene estadísticas de uploads */
router.get("/stats", requireRole("admin", "superadmin"), (req, res) => ctrl(req).getStats(req, res));

/** POST /uploads/cleanup - Limpia uploads expirados */
router.post("/cleanup", requireRole("admin", "superadmin"), (req, res) => ctrl(req).cleanup(req, res));

export default router;