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
  ReportarResena
} from "../../application/ResenasUseCases";
import { ResenasController } from "../controllers/resenas.controller";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

/**
 * Router para endpoints de reseñas.
 * Basado en la API FastAPI de Taller4.
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
    new ReportarResena(repo)
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
      '/resenas',
      '/resenas?page=1&page_size=5'
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
        "GET /resenas (con filtros: id_cancha, id_complejo, order, page, page_size)",
        "POST /resenas (requiere auth + reserva confirmada)",
        "PATCH /resenas/{id} (requiere auth, solo autor)",
        "DELETE /resenas/{id} (requiere auth, autor/admin/superadmin)",
        "POST /resenas/{id}/reportar (requiere auth)"
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

// === Endpoints Públicos ===

/** 
 * GET /resenas - Lista reseñas con filtros opcionales
 * Query params: idCancha, idComplejo, order (recientes|mejor|peor), page, pageSize
 */
router.get("/", (req, res) => ctrl(req).list(req, res));

/** 
 * GET /resenas/:id - Obtiene una reseña específica por ID
 */
router.get("/:id", (req, res) => ctrl(req).getOne(req, res));

// === Endpoints Autenticados ===

/** POST /resenas - Crea nueva reseña (requiere auth + reserva confirmada) */
router.post("/", authMiddleware, (req, res) => ctrl(req).create(req, res));

/** PATCH /resenas/:id - Actualiza reseña (requiere auth, solo autor) */
router.patch("/:id", authMiddleware, (req, res) => ctrl(req).update(req, res));

/** DELETE /resenas/:id - Elimina reseña (requiere auth, permisos especiales) */
router.delete("/:id", authMiddleware, (req, res) => ctrl(req).delete(req, res));

/** POST /resenas/:id/reportar - Reporta una reseña (requiere auth) */
router.post("/:id/reportar", authMiddleware, (req, res) => ctrl(req).reportar(req, res));

export default router;
