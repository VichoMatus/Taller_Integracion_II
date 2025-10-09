import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { ReservaApiRepository } from "../../infrastructure/ReservaApiRepository";
import { 
  ListReservas,
  GetMisReservas,
  CotizarReserva,
  CreateReserva,
  GetReserva,
  UpdateReserva,
  CancelarReserva,
  ConfirmarReserva,
  CheckInReserva,
  NoShowReserva
} from "../../application/ReservasUseCasesNew";
import { ReservasControllerNew } from "../controllers/reservas.controller.new";
import { requireRole } from "../../../admin/presentation/guards/guards";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

/**
 * Router para endpoints de reservas.
 * Maneja la gestión completa de reservas de canchas con nueva arquitectura.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new ReservaApiRepository(http);
  return new ReservasControllerNew(
    new ListReservas(repo),
    new GetMisReservas(repo),
    new CotizarReserva(repo),
    new CreateReserva(repo),
    new GetReserva(repo),
    new UpdateReserva(repo),
    new CancelarReserva(repo),
    new ConfirmarReserva(repo),
    new CheckInReserva(repo),
    new NoShowReserva(repo)
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
      '/api/v1/reservas/cotizar',
      '/api/v1/healthz'
    ];
    
    for (const endpoint of endpointsToTest) {
      try {
        let testResponse;
        if (endpoint.includes('cotizar')) {
          testResponse = await http.post(endpoint, {
            canchaId: 1,
            fechaInicio: "2024-12-20T10:00:00Z",
            fechaFin: "2024-12-20T12:00:00Z"
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
        "GET /api/v1/reservas/mias", 
        "POST /api/v1/reservas/cotizar",
        "POST /api/v1/reservas",
        "GET /api/v1/reservas/{id_reserva}",
        "PATCH /api/v1/reservas/{id_reserva}",
        "POST /api/v1/reservas/{id_reserva}/cancelar",
        "POST /api/v1/reservas/{id_reserva}/confirmar",
        "POST /api/v1/reservas/{id_reserva}/check-in",
        "POST /api/v1/reservas/{id_reserva}/no-show"
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

/** POST /reservas/cotizar - Calcula precio/fees y puede \"hold\" temporal (público) */
router.post("/cotizar", (req, res) => ctrl(req).cotizarReserva(req, res));

// === Endpoints de Usuario Autenticado ===

/** GET /reservas/mias - Reservas del usuario logueado */
router.get("/mias", authMiddleware, (req, res) => ctrl(req).getMisReservas(req, res));

/** POST /reservas - Crea nueva reserva */
router.post("/", authMiddleware, (req, res) => ctrl(req).createReserva(req, res));

/** GET /reservas/:id - Obtiene reserva específica */
router.get("/:id", authMiddleware, (req, res) => ctrl(req).getReserva(req, res));

/** PATCH /reservas/:id - Actualiza/reprograma reserva */
router.patch("/:id", authMiddleware, (req, res) => ctrl(req).updateReserva(req, res));

/** POST /reservas/:id/cancelar - Cancela reserva */
router.post("/:id/cancelar", authMiddleware, (req, res) => ctrl(req).cancelarReserva(req, res));

/** POST /reservas/:id/confirmar - Confirma pago de reserva */
router.post("/:id/confirmar", authMiddleware, (req, res) => ctrl(req).confirmarReserva(req, res));

/** POST /reservas/:id/check-in - Marca asistencia */
router.post("/:id/check-in", authMiddleware, (req, res) => ctrl(req).checkIn(req, res));

/** POST /reservas/:id/no-show - Marca inasistencia */
router.post("/:id/no-show", authMiddleware, (req, res) => ctrl(req).noShow(req, res));

// === Endpoints Administrativos ===
// Requieren rol admin o superadmin

/** GET /reservas - Lista todas las reservas con filtros (vista administrativa) */
router.get("/", requireRole("admin", "superadmin"), (req, res) => ctrl(req).listReservas(req, res));

export default router;