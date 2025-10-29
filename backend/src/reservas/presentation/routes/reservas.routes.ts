import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { ReservaApiRepository } from "../../infrastructure/ReservaApiRepository";
import { 
  ListReservas, 
  GetReserva, 
  CreateReserva, 
  UpdateReserva, 
  DeleteReserva,
  VerificarDisponibilidad,
  GetReservasByUsuario,
  ConfirmarPago,
  CancelarReserva,
  CreateReservaAdmin,
  CancelarReservaAdmin,
  GetReservasByCancha,
  GetReservasByUsuarioAdmin
} from "../../application/ReservasUseCases";
import { ReservasController } from "../controllers/reservas.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

/**
 * Router para endpoints de reservas.
 * Maneja la gestión completa de reservas de canchas.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new ReservaApiRepository(http);
  return new ReservasController(
    new ListReservas(repo),
    new GetReserva(repo),
    new CreateReserva(repo),
    new UpdateReserva(repo),
    new DeleteReserva(repo),
    new VerificarDisponibilidad(repo),
    new GetReservasByUsuario(repo),
    new ConfirmarPago(repo),
    new CancelarReserva(repo),
    // Casos de uso administrativos
    new CreateReservaAdmin(repo),
    new CancelarReservaAdmin(repo),
    new GetReservasByCancha(repo),
    new GetReservasByUsuarioAdmin(repo)
  );
};

// === Endpoint de Prueba de Conectividad ===
/** GET /reservas/status - Verifica estado y conectividad del módulo reservas */
router.get("/status", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    let response;
    let endpoint_tested = "";
    let endpoints_found = [];
    let success = false;
    
    const endpointsToTest = [
      '/api/v1/reservas',
      '/api/v1/reservas/verificar-disponibilidad',
      '/api/v1/healthz'
    ];
    
    for (const endpoint of endpointsToTest) {
      try {
        let testResponse;
        if (endpoint.includes('verificar-disponibilidad')) {
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
      module: "reservas",
      message: success ? "Módulo reservas funcionando correctamente" : "Algunos endpoints con errores",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      endpoints_found,
      available_endpoints: [
        "GET /api/v1/reservas",
        "POST /api/v1/reservas",
        "POST /api/v1/reservas/verificar-disponibilidad",
        "GET /api/v1/reservas/usuario/{usuario_id}",
        "PATCH /api/v1/reservas/{id}",
        "DELETE /api/v1/reservas/{id}"
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      module: "reservas",
      message: "Error conectando con API de reservas",
      fastapi_url: ENV.FASTAPI_URL,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === Endpoints Públicos ===

/** POST /reservas/verificar-disponibilidad - Verificar disponibilidad de cancha (público) */
router.post("/verificar-disponibilidad", (req, res) => ctrl(req).verificarDisponibilidad(req, res));

// === Endpoints de Usuario Autenticado ===
// Requieren autenticación pero permiten a usuarios gestionar sus propias reservas

/** GET /reservas/usuario/:usuarioId - Obtiene reservas de un usuario */
router.get("/usuario/:usuarioId", (req, res) => ctrl(req).getByUsuario(req, res));

/** POST /reservas - Crea nueva reserva */
router.post("/", (req, res) => ctrl(req).create(req, res));

/** GET /reservas/:id - Obtiene reserva específica */
router.get("/:id", (req, res) => ctrl(req).get(req, res));

/** PATCH /reservas/:id - Actualiza reserva */
router.patch("/:id", (req, res) => ctrl(req).update(req, res));

/** POST /reservas/:id/confirmar-pago - Confirma pago de reserva */
router.post("/:id/confirmar-pago", (req, res) => ctrl(req).confirmarPago(req, res));

/** POST /reservas/:id/cancelar - Cancela reserva */
router.post("/:id/cancelar", (req, res) => ctrl(req).cancelar(req, res));

// === Endpoints para Admin/Dueño ===
// Permiten gestión avanzada de reservas

/** POST /reservas/admin/crear - Crear reserva como administrador (para cualquier usuario) */
router.post("/admin/crear", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).createAdmin(req, res));

/** POST /reservas/admin/:id/cancelar - Cancelar reserva como administrador (forzar cancelación) */
router.post("/admin/:id/cancelar", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).cancelarAdmin(req, res));

/** GET /reservas/admin/cancha/:canchaId - Obtener reservas de una cancha específica (administrador) */
router.get("/admin/cancha/:canchaId", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).getByCancha(req, res));

/** GET /reservas/admin/usuario/:usuarioId - Obtener reservas de un usuario específico (administrador) */
router.get("/admin/usuario/:usuarioId", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).getByUsuarioAdmin(req, res));

// === Endpoints Administrativos ===
// Requieren rol admin o super_admin

/** GET /reservas - Lista todas las reservas con filtros */
router.get("/", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).list(req, res));

/** DELETE /reservas/:id - Elimina reserva */
router.delete("/:id", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).delete(req, res));

export default router;
