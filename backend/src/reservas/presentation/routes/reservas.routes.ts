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
 * Subrouter para endpoints administrativos de reservas.
 * Organiza endpoints bajo el prefijo /admin
 */
const adminRouter = Router();

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
      '/api/v1/reservas/mias',
      '/api/v1/reservas/cotizar',
      '/api/v1/healthz'
    ];
    
    for (const endpoint of endpointsToTest) {
      try {
        let testResponse;
        if (endpoint.includes('cotizar')) {
          testResponse = await http.post(endpoint, {
            id_cancha: 1,
            fecha: "2025-10-25",
            inicio: "19:00",
            fin: "20:00"
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
      message: success ? "Módulo reservas funcionando correctamente - ACTUALIZADO con nuevos endpoints" : "Algunos endpoints con errores",
      version: "2.0 - Sincronizado con Taller4",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      endpoints_found,
      available_endpoints: [
        // Endpoints normales (usuario/admin/superadmin)
        "GET /reservas/mias - Mis reservas (usuario autenticado)",
        "GET /reservas - Listado de reservas (admin/superadmin)",
        "GET /reservas/{id} - Detalle de reserva",
        "POST /reservas/cotizar - Cotizar reserva (precio)",
        "POST /reservas - Crear reserva",
        "PATCH /reservas/{id} - Reprogramar/editar reserva", 
        "POST /reservas/{id}/confirmar - Confirmar reserva (admin/superadmin)",
        "POST /reservas/{id}/cancelar - Cancelar reserva",
        // Endpoints administrativos (panel)
        "GET /reservas/admin/cancha/{id} - Reservas por cancha (panel admin)",
        "GET /reservas/admin/usuario/{id} - Reservas por usuario (panel admin)",
        "POST /reservas/admin/crear - Crear reserva como administrador",
        "POST /reservas/admin/{id}/cancelar - Cancelar reserva como administrador"
      ],
      supported_formats: {
        new_format: {
          example: {
            id_cancha: 1,
            fecha: "2025-10-25",
            inicio: "19:00",
            fin: "20:30",
            notas: "Partido amistoso"
          },
          description: "Formato actualizado (Taller4) - fecha + hora separadas"
        },
        legacy_format: {
          example: {
            canchaId: 1,
            fechaInicio: "2025-10-25T19:00:00Z",
            fechaFin: "2025-10-25T20:30:00Z",
            notas: "Partido amistoso"
          },
          description: "Formato legacy - timestamps completos (compatible)"
        }
      },
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

// =========================
// Endpoints Administrativos (Panel) - /admin
// =========================

/** GET /reservas/admin/cancha/:canchaId - Reservas por cancha (panel admin) */
adminRouter.get("/cancha/:canchaId", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).getByCancha(req, res));

/** GET /reservas/admin/usuario/:usuarioId - Reservas por usuario (panel admin) */
adminRouter.get("/usuario/:usuarioId", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).getByUsuarioAdmin(req, res));

/** POST /reservas/admin/crear - Crear reserva como administrador (para cualquier usuario) */
adminRouter.post("/crear", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).createAdmin(req, res));

/** POST /reservas/admin/:id/cancelar - Cancelar reserva como administrador (forzar cancelación) */
adminRouter.post("/:id/cancelar", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).cancelarAdmin(req, res));

// =========================
// Endpoints Normales (Usuario/Admin/SuperAdmin)
// =========================

/** GET /reservas/mias - Mis reservas (usuario autenticado) */
router.get("/mias", authMiddleware, (req, res) => ctrl(req).getByUsuario(req, res));

/** GET /reservas - Listado de reservas (admin/superadmin) */
router.get("/", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).list(req, res));

/** GET /reservas/:id - Detalle de reserva */
router.get("/:id", authMiddleware, (req, res) => ctrl(req).get(req, res));

/** POST /reservas/cotizar - Cotizar reserva (precio) */
router.post("/cotizar", authMiddleware, (req, res) => ctrl(req).cotizar(req, res));

/** POST /reservas - Crear reserva */
router.post("/", authMiddleware, (req, res) => ctrl(req).create(req, res));

/** PATCH /reservas/:id - Reprogramar/editar reserva */
router.patch("/:id", authMiddleware, (req, res) => ctrl(req).update(req, res));

/** POST /reservas/:id/confirmar - Confirmar reserva (admin/superadmin) */
router.post("/:id/confirmar", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).confirmarPago(req, res));

/** POST /reservas/:id/cancelar - Cancelar reserva */
router.post("/:id/cancelar", authMiddleware, (req, res) => ctrl(req).cancelar(req, res));

// Montar el subrouter admin
router.use("/admin", adminRouter);

export default router;
