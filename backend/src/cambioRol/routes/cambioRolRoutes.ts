import { Router } from "express";
import { CambioRolController } from "../interfaces/controllers/cambioRolControllers";
import { ENV } from "../../config/env";
import { buildHttpClient } from "../../infra/http/client";

/**
 * Rutas para cambio de rol de usuarios.
 * Montado sobre `/api/super_admin/usuarios`.
 */
const router = Router();
const controller = new CambioRolController();

// Promocionar el rol de un usuario
router.post("/:id_usuario/rol", (req, res) => controller.promover(req, res));

// Degradar el rol de un usuario
router.post("/:id_usuario/rol/demote", (req, res) => controller.degradar(req, res));

/** GET /usuarios/status - Verifica estado y conectividad del módulo de cambio de rol */
router.get("/status", async (req, res) => {
  try {
    const httpClient = buildHttpClient(ENV.FASTAPI_URL);
    
    let fastApiStatus = "unknown";
    let fastApiConnected = false;
    
    // Intentar conectar con FastAPI
    try {
      const healthCheck = await httpClient.get('/healthz', { 
        timeout: 3000,
        validateStatus: () => true 
      });
      
      if (healthCheck.status >= 200 && healthCheck.status < 300) {
        fastApiStatus = "ok";
        fastApiConnected = true;
      } else {
        fastApiStatus = `error (${healthCheck.status})`;
      }
    } catch (error: any) {
      fastApiStatus = `unreachable (${error.message})`;
    }
    
    res.json({
      ok: true,
      module: "cambio-rol",
      message: "Módulo de cambio de rol funcionando",
      fastapi_url: ENV.FASTAPI_URL,
      fastapi_connected: fastApiConnected,
      fastapi_status: fastApiStatus,
      available_endpoints: [
        {
          method: "POST",
          path: "/api/super_admin/usuarios/:id_usuario/rol",
          description: "Promover usuario a rol superior (admin o super_admin)",
          requires_auth: true,
          requires_role: "super_admin",
          body_example: { rol: "admin" }
        },
        {
          method: "POST",
          path: "/api/super_admin/usuarios/:id_usuario/rol/demote",
          description: "Degradar usuario a rol inferior (admin o usuario)",
          requires_auth: true,
          requires_role: "super_admin",
          body_example: { rol: "usuario" }
        }
      ],
      security: {
        authentication: "Bearer Token (JWT)",
        authorization: "super_admin role required",
        middlewares: ["authMiddleware", "requireSuperAdmin"]
      },
      configuration: {
        fastapi_base_url: ENV.FASTAPI_URL,
        http_client: "buildHttpClient (configured with baseURL)",
        timeout: "10000ms"
      },
      timestamp: new Date().toISOString(),
      fix_applied: "2025-10-30",
      fix_details: "Migrado de axios directo a buildHttpClient con baseURL configurada"
    });
    
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      module: "cambio-rol",
      message: "Error al verificar estado del módulo",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
