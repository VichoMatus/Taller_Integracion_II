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

// === Endpoint de Prueba de Conectividad ===
router.get("/test-api", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    const response = await http.get('/api/v1/healthz', { validateStatus: () => true });
    
    res.json({
      ok: response.status < 400,
      message: response.status < 400 ? "API de uploads funcionando" : "API no disponible",
      fastapi_url: ENV.FASTAPI_URL,
      status: response.status,
      module: "uploads"
    });
  } catch (error: any) {
    res.json({
      ok: false,
      message: "Error conectando con API de uploads",
      fastapi_url: ENV.FASTAPI_URL,
      module: "uploads",
      error: error.message
    });
  }
});

// === Endpoints Públicos ===
router.get("/entidad/:tipoEntidad/:entidadId", (req, res) => ctrl(req).getByEntidad(req, res));
router.get("/:id", (req, res) => ctrl(req).get(req, res));

// === Endpoints de Usuario Autenticado ===
router.post("/", uploadMiddleware.single('file'), (req, res) => ctrl(req).upload(req, res));
router.get("/usuario/:usuarioId", (req, res) => ctrl(req).getByUsuario(req, res));
router.patch("/:id", (req, res) => ctrl(req).update(req, res));
router.delete("/:id", (req, res) => ctrl(req).delete(req, res));
router.post("/:id/processed", (req, res) => ctrl(req).markProcessed(req, res));

// === Endpoints Administrativos ===
router.get("/", requireRole("admin", "superadmin"), (req, res) => ctrl(req).list(req, res));
router.get("/stats", requireRole("admin", "superadmin"), (req, res) => ctrl(req).getStats(req, res));
router.post("/cleanup", requireRole("admin", "superadmin"), (req, res) => ctrl(req).cleanup(req, res));

export default router;