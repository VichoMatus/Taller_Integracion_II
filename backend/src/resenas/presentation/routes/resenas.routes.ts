import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { ResenaApiRepository } from "../../infrastructure/ResenaApiRepository";
import { 
  ListResenas, 
  GetResena, 
  CreateResena, 
  UpdateResena, 
  DeleteResena,
  GetResenasByUsuario,
  GetResenasByComplejo,
  DarLike,
  QuitarLike,
  ReportarResena,
  GetEstadisticasResenas,
  ResponderResena
} from "../../application/ResenasUseCases";
import { ResenasController } from "../controllers/resenas.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

/**
 * Router para endpoints de reseñas.
 * Maneja la gestión completa de reseñas de complejos deportivos.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new ResenaApiRepository(http);
  return new ResenasController(
    new ListResenas(repo),
    new GetResena(repo),
    new CreateResena(repo),
    new UpdateResena(repo),
    new DeleteResena(repo),
    new GetResenasByUsuario(repo),
    new GetResenasByComplejo(repo),
    new DarLike(repo),
    new QuitarLike(repo),
    new ReportarResena(repo),
    new GetEstadisticasResenas(repo),
    new ResponderResena(repo)
  );
};

// === Endpoint de Prueba de Conectividad ===
/** GET /resenas/status - Verifica estado y conectividad del módulo reseñas */
router.get("/status", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    let response;
    let endpoint_tested = "";
    let endpoints_found = [];
    let success = false;
    
    const endpointsToTest = [
      '/api/v1/resenas',
      '/api/v1/resenas/complejo/1',
      '/api/v1/resenas/estadisticas/1',
      '/api/v1/healthz'
    ];
    
    for (const endpoint of endpointsToTest) {
      try {
        const testResponse = await http.get(endpoint, { validateStatus: () => true });
        if (testResponse.status < 500) {
          endpoints_found.push(`${endpoint} ✅ (${testResponse.status})`);
          if (testResponse.status < 400) {
            endpoint_tested = endpoint;
            response = testResponse;
            success = true;
          }
        } else {
          endpoints_found.push(`${endpoint} ❌ (${testResponse.status})`);
        }
      } catch (error) {
        endpoints_found.push(`${endpoint} ❌ (error)`);
      }
    }
    
    res.json({
      ok: success,
      module: "resenas",
      message: success ? "Módulo reseñas funcionando correctamente" : "Algunos endpoints con errores",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      endpoints_found,
      available_endpoints: [
        "GET /api/v1/resenas",
        "POST /api/v1/resenas",
        "GET /api/v1/resenas/complejo/{complejo_id}",
        "GET /api/v1/resenas/estadisticas/{complejo_id}",
        "PATCH /api/v1/resenas/{id}",
        "DELETE /api/v1/resenas/{id}"
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      module: "resenas",
      message: "Error conectando con API de reseñas",
      fastapi_url: ENV.FASTAPI_URL,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === Endpoints Públicos (solo lectura) ===

/** GET /resenas/complejo/:complejoId - Obtiene reseñas de un complejo (público) */
router.get("/complejo/:complejoId", (req, res) => ctrl(req).getByComplejo(req, res));

/** GET /resenas/estadisticas/:complejoId - Obtiene estadísticas de reseñas (público) */
router.get("/estadisticas/:complejoId", (req, res) => ctrl(req).getEstadisticas(req, res));

/** GET /resenas/:id - Obtiene reseña específica (público) */
router.get("/:id", (req, res) => ctrl(req).get(req, res));

// === Endpoints de Usuario Autenticado ===
// Requieren autenticación para interactuar con reseñas

/** GET /resenas/usuario/:usuarioId - Obtiene reseñas de un usuario */
router.get("/usuario/:usuarioId", (req, res) => ctrl(req).getByUsuario(req, res));

/** POST /resenas - Crea nueva reseña */
router.post("/", (req, res) => ctrl(req).create(req, res));

/** PATCH /resenas/:id - Actualiza reseña (solo el autor) */
router.patch("/:id", (req, res) => ctrl(req).update(req, res));

/** POST /resenas/:id/like - Da like a una reseña */
router.post("/:id/like", (req, res) => ctrl(req).darLike(req, res));

/** DELETE /resenas/:id/like - Quita like de una reseña */
router.delete("/:id/like", (req, res) => ctrl(req).quitarLike(req, res));

/** POST /resenas/:id/reportar - Reporta una reseña */
router.post("/:id/reportar", (req, res) => ctrl(req).reportar(req, res));

/** POST /resenas/:id/responder - Responde a una reseña (dueño del complejo) */
router.post("/:id/responder", (req, res) => ctrl(req).responder(req, res));

// === Endpoints Administrativos ===
// Requieren rol admin o superadmin

/** GET /resenas - Lista todas las reseñas con filtros */
router.get("/", authMiddleware, requireRole("admin", "superadmin"), (req, res) => ctrl(req).list(req, res));

/** DELETE /resenas/:id - Elimina reseña */
router.delete("/:id", authMiddleware, requireRole("admin", "superadmin"), (req, res) => ctrl(req).delete(req, res));

export default router;
