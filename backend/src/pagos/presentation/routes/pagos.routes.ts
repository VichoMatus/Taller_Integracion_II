import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { HttpPagoRepository } from "../../../infrastructure/http/pagos-repository";
import { 
  ListPagos,
  GetPago,
  GetPagosByReserva,
  CreatePago,
  UpdatePago,
  ProcesarPago,
  ConfirmarPago,
  ReembolsarPago
} from "../../application/PagosUseCases";
import { PagosController } from "../controllers/pagos.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

/**
 * Router para endpoints de pagos.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 */
const ctrl = (req: any) => {
  const repo = new HttpPagoRepository(ENV.FASTAPI_URL);
  return new PagosController(
    new ListPagos(repo),
    new GetPago(repo),
    new GetPagosByReserva(repo),
    new CreatePago(repo),
    new UpdatePago(repo),
    new ProcesarPago(repo),
    new ConfirmarPago(repo),
    new ReembolsarPago(repo)
  );
};

// === Endpoint de Prueba de Conectividad ===
/** GET /pagos/status - Verifica estado y conectividad del módulo pagos */
router.get("/status", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    let response;
    let endpoint_tested = "";
    let endpoints_found = [];
    let success = false;
    
    const endpointsToTest = [
      '/api/v1/pagos',
      '/api/v1/reservas/1/pagos', // Test con ID ejemplo
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
      module: "pagos",
      message: success ? "Módulo pagos funcionando correctamente" : "Algunos endpoints con errores",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      endpoints_found,
      available_endpoints: [
        "GET /api/v1/pagos",
        "POST /api/v1/pagos",
        "GET /api/v1/pagos/{id}",
        "PATCH /api/v1/pagos/{id}",
        "POST /api/v1/pagos/{id}/procesar",
        "POST /api/v1/pagos/{id}/confirmar",
        "POST /api/v1/pagos/{id}/reembolsar",
        "GET /api/v1/reservas/{reservaId}/pagos"
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      module: "pagos",
      message: "Error conectando con API de pagos",
      fastapi_url: ENV.FASTAPI_URL,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === Endpoints de Usuario Autenticado ===
// Todos los endpoints de pagos requieren autenticación

/** GET /pagos - Listar pagos (requiere autenticación) */
router.get("/", authMiddleware, (req, res) => ctrl(req).listPagos(req, res));

/** GET /pagos/:id - Obtener pago específico (requiere autenticación) */
router.get("/:id", authMiddleware, (req, res) => ctrl(req).getPago(req, res));

/** POST /pagos - Crear pago (requiere autenticación) */
router.post("/", authMiddleware, (req, res) => ctrl(req).createPago(req, res));

/** PATCH /pagos/:id - Actualizar pago (requiere autenticación) */
router.patch("/:id", authMiddleware, (req, res) => ctrl(req).updatePago(req, res));

/** POST /pagos/:id/procesar - Procesar pago (requiere autenticación) */
router.post("/:id/procesar", authMiddleware, (req, res) => ctrl(req).procesarPago(req, res));

/** POST /pagos/:id/confirmar - Confirmar pago (requiere autenticación) */
router.post("/:id/confirmar", authMiddleware, (req, res) => ctrl(req).confirmarPago(req, res));

// === Endpoints Administrativos ===
// Requieren rol admin o superadmin

/** POST /pagos/:id/reembolsar - Reembolsar pago (requiere rol admin) */
router.post("/:id/reembolsar", authMiddleware, requireRole("admin", "superadmin"), (req, res) => ctrl(req).reembolsarPago(req, res));

// === Endpoints relacionados con reservas ===

/** GET /reservas/:reservaId/pagos - Obtener pagos por reserva (requiere autenticación) */
router.get("/reservas/:reservaId/pagos", authMiddleware, (req, res) => ctrl(req).getPagosByReserva(req, res));

export default router;