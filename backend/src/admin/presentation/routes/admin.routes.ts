import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { AdminApiRepository } from "../../../admin/infraestructure/AdminApiRepository";
import { 
  GetMisRecursos, 
  GetMisComplejos, 
  GetMisCanchas, 
  GetMisReservas, 
  GetMisEstadisticas,
  CreateComplejo,
  GetComplejo,
  UpdateComplejo,
  DeleteComplejo,
  CreateCancha,
  GetCancha,
  UpdateCancha,
  DeleteCancha
} from "../../../admin/application/UsersUseCases";
import { AdminController } from "../../../admin/presentation/controllers/admin.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

/**
 * Router para endpoints administrativos.
 * Maneja la gestión de usuarios y asignación de roles.
 *
 * Todos los endpoints requieren rol admin o superadmin.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new AdminApiRepository(http);
  return new AdminController(
    new GetMisRecursos(repo),
    new GetMisComplejos(repo),
    new GetMisCanchas(repo),
    new GetMisReservas(repo),
    new GetMisEstadisticas(repo),
    new CreateComplejo(repo),
    new GetComplejo(repo),
    new UpdateComplejo(repo),
    new DeleteComplejo(repo),
    new CreateCancha(repo),
    new GetCancha(repo),
    new UpdateCancha(repo),
    new DeleteCancha(repo)
  );
};

// === Endpoints del Panel del Dueño ===
// Requieren ser dueño, admin o superadmin para acceso

/** GET /admin/panel - Obtiene resumen de recursos del dueño */
router.get("/panel", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).getMisRecursos(req, res));

// === Endpoints de Complejos ===

/** GET /admin/complejos - Lista complejos del dueño */
router.get("/complejos", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).listComplejos(req, res));

/** POST /admin/complejos - Crea nuevo complejo */
router.post("/complejos", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).createComplejo(req, res));

/** GET /admin/complejos/:id - Obtiene complejo específico */
router.get("/complejos/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).getComplejo(req, res));

/** PUT /admin/complejos/:id - Actualiza complejo */
router.put("/complejos/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).updateComplejo(req, res));

/** DELETE /admin/complejos/:id - Elimina complejo */
router.delete("/complejos/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).deleteComplejo(req, res));

// === Endpoints de Canchas ===

/** GET /admin/canchas - Lista canchas del dueño */
router.get("/canchas", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).listCanchas(req, res));

/** POST /admin/canchas - Crea nueva cancha */
router.post("/canchas", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).createCancha(req, res));

/** GET /admin/canchas/:id - Obtiene cancha específica */
router.get("/canchas/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).getCancha(req, res));

/** PUT /admin/canchas/:id - Actualiza cancha */
router.put("/canchas/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).updateCancha(req, res));

/** DELETE /admin/canchas/:id - Elimina cancha */
router.delete("/canchas/:id", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).deleteCancha(req, res));

// === Endpoints de Reservas y Estadísticas ===

/** GET /admin/reservas - Lista reservas del dueño */
router.get("/reservas", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).getMisReservas(req, res));

/** GET /admin/estadisticas - Obtiene estadísticas del dueño */
router.get("/estadisticas", authMiddleware, requireRole("dueno", "admin", "superadmin"), (req, res) => ctrl(req).getMisEstadisticas(req, res));

/** GET /admin/status - Verifica estado y conectividad del módulo admin */
router.get("/status", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    let response;
    let endpoint_tested = "";
    let endpoints_found = [];
    let success = false;
    
    // Probar endpoints reales que usan los owners
    const endpointsToTest = [
      '/complejos',
      '/canchas', 
      '/reservas'
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
      module: "admin-owner",
      message: success ? "Módulo admin owner funcionando correctamente" : "Algunos endpoints con errores",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      endpoints_found,
      success,
      available_endpoints: [
        "GET /complejos - Lista complejos",
        "POST /complejos - Crear complejo",
        "GET /complejos/{id} - Ver complejo",
        "PUT /complejos/{id} - Actualizar complejo", 
        "DELETE /complejos/{id} - Eliminar complejo",
        "GET /canchas - Lista canchas",
        "POST /canchas - Crear cancha",
        "GET /canchas/{id} - Ver cancha",
        "PUT /canchas/{id} - Actualizar cancha",
        "DELETE /canchas/{id} - Eliminar cancha",
        "GET /reservas - Lista reservas"
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      module: "admin", 
      message: "Error conectando con FastAPI",
      fastapi_url: ENV.FASTAPI_URL,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
