import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { DisponibilidadApiRepository } from "../../infrastructure/DisponibilidadApiRepository";
import { 
  GetDisponibilidad,
  ListHorarios,
  GetHorario,
  CreateHorario,
  UpdateHorario,
  DeleteHorario,
  ListBloqueos,
  GetBloqueo,
  CreateBloqueo,
  DeleteBloqueo
} from "../../application/DisponibilidadUseCases";
import { DisponibilidadController } from "../controllers/disponibilidad.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

/**
 * Router para endpoints de disponibilidad, horarios y bloqueos.
 * Maneja la gestión completa de disponibilidad de canchas.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new DisponibilidadApiRepository(http);
  return new DisponibilidadController(
    new GetDisponibilidad(repo),
    new ListHorarios(repo),
    new GetHorario(repo),
    new CreateHorario(repo),
    new UpdateHorario(repo),
    new DeleteHorario(repo),
    new ListBloqueos(repo),
    new GetBloqueo(repo),
    new CreateBloqueo(repo),
    new DeleteBloqueo(repo)
  );
};

// === Endpoint de Prueba de Conectividad ===
/** GET /disponibilidad/status - Verifica estado y conectividad del módulo disponibilidad */
router.get("/status", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    let response;
    let endpoint_tested = "";
    let endpoints_found = [];
    let success = false;
    
    const endpointsToTest = [
      '/api/v1/disponibilidad',
      '/api/v1/horarios',
      '/api/v1/bloqueos',
      '/api/v1/healthz'
    ];
    
    for (const endpoint of endpointsToTest) {
      try {
        let testResponse;
        if (endpoint.includes('disponibilidad')) {
          testResponse = await http.get(`${endpoint}?fecha_inicio=2024-12-20&fecha_fin=2024-12-21&id_complejo=1`, { validateStatus: () => true });
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
      module: "disponibilidad",
      message: success ? "Módulo disponibilidad funcionando correctamente" : "Algunos endpoints con errores",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      endpoints_found,
      available_endpoints: [
        "GET /api/v1/disponibilidad",
        "GET /api/v1/horarios",
        "POST /api/v1/horarios", 
        "PATCH /api/v1/horarios/{id}",
        "DELETE /api/v1/horarios/{id}",
        "GET /api/v1/bloqueos",
        "POST /api/v1/bloqueos",
        "DELETE /api/v1/bloqueos/{id}"
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      module: "disponibilidad",
      message: "Error conectando con API de disponibilidad",
      fastapi_url: ENV.FASTAPI_URL,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === Endpoints Públicos ===

/** GET /disponibilidad - Consultar disponibilidad de canchas (público) */
router.get("/", (req, res) => ctrl(req).getDisponibilidad(req, res));

// === Endpoints de Horarios ===
// Requieren autenticación para crear/modificar, pero lectura puede ser pública

/** GET /horarios - Listar horarios */
router.get("/horarios", (req, res) => ctrl(req).listHorarios(req, res));

/** GET /horarios/:id - Obtener horario específico */
router.get("/horarios/:id", (req, res) => ctrl(req).getHorario(req, res));

/** POST /horarios - Crear horario (requiere autenticación) */
router.post("/horarios", authMiddleware, (req, res) => ctrl(req).createHorario(req, res));

/** PATCH /horarios/:id - Actualizar horario (requiere autenticación) */  
router.patch("/horarios/:id", authMiddleware, (req, res) => ctrl(req).updateHorario(req, res));

/** DELETE /horarios/:id - Eliminar horario (requiere rol admin) */
router.delete("/horarios/:id", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).deleteHorario(req, res));

// === Endpoints de Bloqueos ===
// Requieren autenticación para todas las operaciones

/** GET /bloqueos - Listar bloqueos (requiere autenticación) */
router.get("/bloqueos", authMiddleware, (req, res) => ctrl(req).listBloqueos(req, res));

/** GET /bloqueos/:id - Obtener bloqueo específico (requiere autenticación) */
router.get("/bloqueos/:id", authMiddleware, (req, res) => ctrl(req).getBloqueo(req, res));

/** POST /bloqueos - Crear bloqueo (requiere autenticación) */
router.post("/bloqueos", authMiddleware, (req, res) => ctrl(req).createBloqueo(req, res));

/** DELETE /bloqueos/:id - Eliminar bloqueo (requiere rol admin o owner del bloqueo) */
router.delete("/bloqueos/:id", authMiddleware, (req, res) => ctrl(req).deleteBloqueo(req, res));

export default router;