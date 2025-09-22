import { Router } from "express";
import { ENV } from "../../config/env";
import { buildHttpClient } from "../../infra/http/client";
import { getBearerFromReq } from "../../interfaces/auth";

const router = Router();

/** GET /complejos/test-api - Prueba conectividad REAL con la API de complejos */
router.get("/test-api", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    let response;
    let endpoint_tested = "";
    let endpoints_found = [];
    let success = false;
    
    const endpointsToTest = [
      '/api/v1/complejos',
      '/api/v1/complejos/1',
      '/api/v1/complejos/1/canchas',
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
      message: success ? "API de complejos funcionando" : "API responde con errores",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      module: "complejos",
      endpoints_found,
      real_endpoints: [
        "GET /api/v1/complejos",
        "POST /api/v1/complejos",
        "GET /api/v1/complejos/{id_complejo}",
        "PATCH /api/v1/complejos/{id_complejo}",
        "DELETE /api/v1/complejos/{id_complejo}",
        "GET /api/v1/complejos/{id_complejo}/canchas",
        "GET /api/v1/complejos/{id_complejo}/horarios",
        "GET /api/v1/complejos/{id_complejo}/bloqueos",
        "GET /api/v1/complejos/{id_complejo}/resumen"
      ]
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      message: "Error conectando con API de complejos",
      fastapi_url: ENV.FASTAPI_URL,
      module: "complejos",
      error: error.message
    });
  }
});

// Endpoints reales de complejos
router.get("/", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    const { data } = await http.get('/api/v1/complejos', { params: req.query });
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
    const { data } = await http.get(`/api/v1/complejos/${req.params.id}`);
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

router.get("/:id/canchas", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    const { data } = await http.get(`/api/v1/complejos/${req.params.id}/canchas`);
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

export default router;
