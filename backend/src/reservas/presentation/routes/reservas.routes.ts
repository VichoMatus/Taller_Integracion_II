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
  CancelarReserva
} from "../../application/ReservasUseCases";
import { ReservasController } from "../controllers/reservas.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";

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
    new CancelarReserva(repo)
  );
};

// === Endpoint de Prueba de Conectividad ===
/** GET /reservas/test-api - Prueba conectividad REAL con la API de reservas */
router.get("/test-api", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    let response;
    let endpoint_tested = "";
    
    try {
      // Probar endpoint de verificar disponibilidad
      response = await http.post('/reservas/verificar-disponibilidad', {
        cancha_id: 1,
        fecha_inicio: "2024-12-20T10:00:00Z",
        fecha_fin: "2024-12-20T12:00:00Z"
      }, { validateStatus: () => true });
      endpoint_tested = "/reservas/verificar-disponibilidad";
    } catch (error) {
      try {
        // Intentar listar reservas
        response = await http.get('/reservas', { validateStatus: () => true });
        endpoint_tested = "/reservas";
      } catch (error2) {
        // Fallback a docs
        response = await http.get('/docs', { validateStatus: () => true });
        endpoint_tested = "/docs (fallback)";
      }
    }
    
    res.json({
      ok: response.status < 400,
      message: response.status < 400 ? "API de reservas respondió correctamente" : "API respondió con error",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response.status,
      module: "reservas",
      available_endpoints: [
        "POST /reservas/verificar-disponibilidad",
        "GET /reservas",
        "POST /reservas",
        "GET /reservas/usuario/{usuario_id}"
      ]
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      message: "Error conectando con API de reservas",
      fastapi_url: ENV.FASTAPI_URL,
      module: "reservas",
      error: error.message,
      connection_issue: !error.response ? "No se pudo establecer conexión" : "API respondió con error"
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

// === Endpoints Administrativos ===
// Requieren rol admin o superadmin

/** GET /reservas - Lista todas las reservas con filtros */
router.get("/", requireRole("admin", "superadmin"), (req, res) => ctrl(req).list(req, res));

/** DELETE /reservas/:id - Elimina reserva */
router.delete("/:id", requireRole("admin", "superadmin"), (req, res) => ctrl(req).delete(req, res));

export default router;
