import { Router } from "express";
import { ENV } from "../../config/env";
import { buildHttpClient } from "../../infra/http/client";
import { getBearerFromReq } from "../../interfaces/auth";

const router = Router();

/** GET /canchas/test-api - Prueba conectividad REAL con la API de canchas */
router.get("/test-api", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    let response;
    let endpoint_tested = "";
    let endpoints_found = [];
    let success = false;
    
    // Probar endpoints reales de canchas
    const endpointsToTest = [
      '/api/v1/canchas',
      '/api/v1/canchas/1',
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
        }
      } catch (error) {
        endpoints_found.push(`${endpoint} ❌ (error)`);
      }
    }
    
    res.json({
      ok: success,
      message: success ? "API de canchas funcionando" : "API responde con errores",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      module: "canchas",
      endpoints_found,
      real_endpoints: [
        "GET /api/v1/canchas",
        "POST /api/v1/canchas",
        "GET /api/v1/canchas/{id_cancha}",
        "PATCH /api/v1/canchas/{id_cancha}",
        "DELETE /api/v1/canchas/{id_cancha}",
        "GET /api/v1/canchas/{id_cancha}/fotos",
        "POST /api/v1/canchas/{id_cancha}/fotos",
        "DELETE /api/v1/canchas/{id_cancha}/fotos/{id_foto}"
      ]
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      message: "Error conectando con API de canchas",
      fastapi_url: ENV.FASTAPI_URL,
      module: "canchas",
      error: error.message
    });
  }
});

// Endpoints reales de canchas
router.get("/", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    const { data } = await http.get('/api/v1/canchas', { params: req.query });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    const { data } = await http.get(`/api/v1/canchas/${req.params.id}`);
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

export default router;
