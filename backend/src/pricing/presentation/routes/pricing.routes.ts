import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { HttpPricingRepository } from "../../../infrastructure/http/pricing-repository";
import { 
  ListPricingRules,
  GetPricingRule,
  CreatePricingRule,
  UpdatePricingRule,
  DeletePricingRule,
  ListPromociones,
  GetPromocion,
  CreatePromocion,
  UpdatePromocion,
  DeletePromocion
} from "../../application/PricingUseCases";
import { PricingController } from "../controllers/pricing.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

/**
 * Router para endpoints de pricing (reglas de precio y promociones).
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 */
const ctrl = (req: any) => {
  const repo = new HttpPricingRepository(ENV.FASTAPI_URL);
  return new PricingController(
    new ListPricingRules(repo),
    new GetPricingRule(repo),
    new CreatePricingRule(repo),
    new UpdatePricingRule(repo),
    new DeletePricingRule(repo),
    new ListPromociones(repo),
    new GetPromocion(repo),
    new CreatePromocion(repo),
    new UpdatePromocion(repo),
    new DeletePromocion(repo)
  );
};

// === Endpoint de Prueba de Conectividad ===
/** GET /pricing/status - Verifica estado y conectividad del módulo pricing */
router.get("/status", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    let response;
    let endpoint_tested = "";
    let endpoints_found = [];
    let success = false;
    
    const endpointsToTest = [
      '/api/v1/pricing',
      '/api/v1/promociones',
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
      module: "pricing",
      message: success ? "Módulo pricing funcionando correctamente" : "Algunos endpoints con errores",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      endpoints_found,
      available_endpoints: [
        "GET /api/v1/pricing",
        "POST /api/v1/pricing",
        "GET /api/v1/pricing/{id}",
        "PATCH /api/v1/pricing/{id}",
        "DELETE /api/v1/pricing/{id}",
        "GET /api/v1/promociones",
        "POST /api/v1/promociones",
        "GET /api/v1/promociones/{id}",
        "PATCH /api/v1/promociones/{id}",
        "DELETE /api/v1/promociones/{id}"
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      module: "pricing",
      message: "Error conectando con API de pricing",
      fastapi_url: ENV.FASTAPI_URL,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === Endpoints Públicos ===

/** GET /pricing - Listar reglas de precio (público) */
router.get("/", (req, res) => ctrl(req).listPricingRules(req, res));

/** GET /pricing/:id - Obtener regla de precio específica (público) */
router.get("/:id", (req, res) => ctrl(req).getPricingRule(req, res));

/** GET /promociones - Listar promociones (público) */
router.get("/promociones", (req, res) => ctrl(req).listPromociones(req, res));

/** GET /promociones/:id - Obtener promoción específica (público) */
router.get("/promociones/:id", (req, res) => ctrl(req).getPromocion(req, res));

// === Endpoints Administrativos ===
// Requieren autenticación y permisos específicos

/** POST /pricing - Crear regla de precio (requiere rol admin) */
router.post("/", requireRole("admin", "superadmin"), (req, res) => ctrl(req).createPricingRule(req, res));

/** PATCH /pricing/:id - Actualizar regla de precio (requiere rol admin) */
router.patch("/:id", requireRole("admin", "superadmin"), (req, res) => ctrl(req).updatePricingRule(req, res));

/** DELETE /pricing/:id - Eliminar regla de precio (requiere rol admin) */
router.delete("/:id", requireRole("admin", "superadmin"), (req, res) => ctrl(req).deletePricingRule(req, res));

/** POST /promociones - Crear promoción (requiere autenticación) */
router.post("/promociones", authMiddleware, (req, res) => ctrl(req).createPromocion(req, res));

/** PATCH /promociones/:id - Actualizar promoción (requiere autenticación) */
router.patch("/promociones/:id", authMiddleware, (req, res) => ctrl(req).updatePromocion(req, res));

/** DELETE /promociones/:id - Eliminar promoción (requiere rol admin) */
router.delete("/promociones/:id", requireRole("admin", "superadmin"), (req, res) => ctrl(req).deletePromocion(req, res));

export default router;