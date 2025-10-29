import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { BloqueoApiRepository } from "../../infrastructure/BloqueoApiRepository";
import { 
  ListBloqueos, 
  GetBloqueo, 
  CreateBloqueo, 
  UpdateBloqueo, 
  DeleteBloqueo,
  VerificarConflictoBloqueo,
  GetBloqueosActivos,
  GetBloqueosByCreador,
  ActivarBloqueo,
  DesactivarBloqueo
} from "../../application/BloqueosUseCases";
import { BloqueosController } from "../controllers/bloqueos.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

/**
 * Router para endpoints de bloqueos.
 * Maneja la gestión completa de bloqueos de canchas.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new BloqueoApiRepository(http);
  return new BloqueosController(
    new ListBloqueos(repo),
    new GetBloqueo(repo),
    new CreateBloqueo(repo),
    new UpdateBloqueo(repo),
    new DeleteBloqueo(repo),
    new VerificarConflictoBloqueo(repo),
    new GetBloqueosActivos(repo),
    new GetBloqueosByCreador(repo),
    new ActivarBloqueo(repo),
    new DesactivarBloqueo(repo)
  );
};

// === Endpoint de Prueba de Conectividad ===
/** GET /bloqueos/status - Verifica estado y conectividad del módulo bloqueos */
router.get("/status", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    let response;
    let endpoint_tested = "";
    let endpoints_found = [];
    let success = false;
    
    const endpointsToTest = [
      '/api/v1/bloqueos',
      '/api/v1/bloqueos/verificar-conflicto',
      '/api/v1/healthz'
    ];
    
    for (const endpoint of endpointsToTest) {
      try {
        let testResponse;
        if (endpoint.includes('verificar-conflicto')) {
          testResponse = await http.post(endpoint, {
            cancha_id: 1,
            fecha_inicio: "2024-12-20T10:00:00Z",
            fecha_fin: "2024-12-20T12:00:00Z"
          }, { validateStatus: () => true });
        } else {
          testResponse = await http.get(endpoint, { validateStatus: () => true });
        }
        
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
      module: "bloqueos",
      message: success ? "Módulo bloqueos funcionando correctamente" : "Algunos endpoints con errores",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      endpoints_found,
      available_endpoints: [
        "GET /api/v1/bloqueos",
        "POST /api/v1/bloqueos",
        "POST /api/v1/bloqueos/verificar-conflicto",
        "GET /api/v1/bloqueos/activos/{cancha_id}",
        "PATCH /api/v1/bloqueos/{id}",
        "DELETE /api/v1/bloqueos/{id}"
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      module: "bloqueos",
      message: "Error conectando con API de bloqueos",
      fastapi_url: ENV.FASTAPI_URL,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === Endpoints Públicos ===

/** POST /bloqueos/verificar-conflicto - Verifica conflictos entre bloqueos (público) */
router.post("/verificar-conflicto", (req, res) => ctrl(req).verificarConflicto(req, res));

/** GET /bloqueos/activos/:canchaId - Obtiene bloqueos activos de una cancha (público) */
router.get("/activos/:canchaId", (req, res) => ctrl(req).getActivos(req, res));

// === Endpoints de Dueños y Administradores ===
// Requieren autenticación para gestionar bloqueos

/** GET /bloqueos/creador/:creadoPorId - Obtiene bloqueos de un creador */
router.get("/creador/:creadoPorId", (req, res) => ctrl(req).getByCreador(req, res));

/** POST /bloqueos - Crea nuevo bloqueo */
router.post("/", (req, res) => ctrl(req).create(req, res));

/** GET /bloqueos/:id - Obtiene bloqueo específico */
router.get("/:id", (req, res) => ctrl(req).get(req, res));

/** PATCH /bloqueos/:id - Actualiza bloqueo */
router.patch("/:id", (req, res) => ctrl(req).update(req, res));

/** POST /bloqueos/:id/activar - Activa bloqueo */
router.post("/:id/activar", (req, res) => ctrl(req).activar(req, res));

/** POST /bloqueos/:id/desactivar - Desactiva bloqueo */
router.post("/:id/desactivar", (req, res) => ctrl(req).desactivar(req, res));

// === Endpoints Administrativos ===
// Requieren rol admin o super_admin

/** GET /bloqueos - Lista todos los bloqueos con filtros */
router.get("/", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).list(req, res));

/** DELETE /bloqueos/:id - Elimina bloqueo */
router.delete("/:id", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).delete(req, res));

export default router;
