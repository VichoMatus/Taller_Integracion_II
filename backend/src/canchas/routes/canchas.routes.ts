import { Router } from "express";
import { ENV } from "../../config/env";
import { buildHttpClient } from "../../infra/http/client";
import { getBearerFromReq } from "../../interfaces/auth";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { requireRole } from "../../admin/presentation/guards/guards";

const router = Router();

/** GET /canchas/status - Verifica estado y conectividad del módulo canchas (PÚBLICO) */
router.get("/status", async (req, res) => {
  try {
    // No requiere autenticación - endpoint público de diagnóstico
    const http = buildHttpClient(ENV.FASTAPI_URL, () => "");
    
    let response;
    let endpoint_tested = "";
    let endpoints_found = [];
    let success = false;
    
    // Probar endpoints actualizados de canchas (Taller4)
    const endpointsToTest = [
      '/api/v1/canchas',
      '/api/v1/canchas/admin',
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
      module: "canchas",
      message: success ? "Módulo canchas funcionando correctamente - ACTUALIZADO con Taller4" : "API responde con errores",
      version: "2.0 - Sincronizado con Taller4",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      endpoints_found,
      available_endpoints: [
        // Endpoints públicos
        "GET /canchas - Lista canchas con filtros avanzados",
        "GET /canchas/{id} - Detalle de cancha con rating y distancia",
        "GET /canchas/{id}/fotos - Lista fotos de cancha",
        // Endpoints administrativos
        "GET /canchas/admin - Lista canchas para panel (admin/superadmin)",
        "POST /canchas - Crear cancha (dueño/admin/superadmin)",
        "PATCH /canchas/{id} - Editar cancha (dueño/admin/superadmin)",
        "DELETE /canchas/{id} - Eliminar/archivar cancha (dueño/admin/superadmin)",
        "POST /canchas/{id}/fotos - Agregar foto (dueño/admin/superadmin)",
        "DELETE /canchas/{id}/fotos/{foto_id} - Eliminar foto (dueño/admin/superadmin)"
      ],
      new_features: [
        "Filtros avanzados: cubierta/techada, iluminacion, max_precio",
        "Búsqueda geográfica: lat/lon/max_km con cálculo de distancia",
        "Ordenamiento: distancia, precio, rating, nombre, recientes", 
        "Panel administrativo con endpoint /admin",
        "Rating promedio y total de reseñas en respuesta",
        "Paginación estándar con total de registros"
      ],
      supported_filters: {
        public: ["q", "id_complejo", "deporte", "cubierta/techada", "iluminacion", "max_precio", "lat", "lon", "max_km"],
        admin: ["q", "id_complejo", "deporte", "cubierta", "iluminacion", "incluir_inactivas"]
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      module: "canchas",
      message: "Error conectando con API de canchas",
      fastapi_url: ENV.FASTAPI_URL,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== ENDPOINTS PÚBLICOS =====

/** GET /canchas - Lista canchas con filtros avanzados (PÚBLICO) */
router.get("/", async (req, res) => {
  try {
    // Endpoint público - no requiere autenticación
    const http = buildHttpClient(ENV.FASTAPI_URL, () => "");
    
    // Mapear filtros del frontend a formato Taller4
    const params = {
      ...req.query,
      // Soporte para ambos nombres: cubierta/techada
      cubierta: req.query.cubierta || req.query.techada,
    };
    
    const { data } = await http.get('/canchas', { params });
    // End route
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

/** GET /canchas/admin - Lista canchas para panel administrativo (REQUIERE AUTH) */
router.get("/admin", authMiddleware, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    // Requiere autenticación - admin/super_admin
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    // Parámetros específicos para el panel admin
    // Ajustes: validar page_size para evitar que FastAPI devuelva 422 al pedir demasiados items
    const requestedPageSize = Number(req.query.page_size || 20);
    const pageSize = Number.isFinite(requestedPageSize) ? Math.max(1, Math.min(requestedPageSize, 100)) : 20;

    const params = {
      id_complejo: req.query.id_complejo,
      q: req.query.q,
      incluir_inactivas: req.query.incluir_inactivas || true,
      sort_by: req.query.sort_by || 'nombre',
      order: req.query.order || 'asc',
      page: req.query.page || 1,
      page_size: pageSize,
    };
    
    try {
      const { data } = await http.get('/canchas/admin', { params });
      return res.json({ ok: true, data });
    } catch (error: any) {
      // Si FastAPI devuelve 422 por page_size, intentar con un page_size menor
      if (error?.response?.status === 422 && pageSize > 20) {
        try {
          const smaller = { ...params, page_size: 20 };
          const { data } = await http.get('/canchas/admin', { params: smaller });
          return res.json({ ok: true, data });
        } catch (err2: any) {
          return res.status(err2.response?.status || 500).json({ ok: false, error: { code: err2.response?.status || 500, message: err2.message } });
        }
      }
      return res.status(error.response?.status || 500).json({ ok: false, error: { code: error.response?.status || 500, message: error.message } });
    }
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

/** GET /canchas/:id - Obtiene detalle de cancha con rating y distancia opcional (PÚBLICO) */
router.get("/:id", async (req, res) => {
  try {
    // Endpoint público - no requiere autenticación
    const http = buildHttpClient(ENV.FASTAPI_URL, () => "");
    
    // Parámetros opcionales para cálculo de distancia
    const params = {
      lat: req.query.lat,
      lon: req.query.lon,
    };
    
    const { data } = await http.get(`/canchas/${req.params.id}`, { params });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

// ===== ENDPOINTS PRIVADOS (REQUIEREN AUTENTICACIÓN) =====

/** GET /canchas/:id/fotos - Lista fotos de la cancha (PÚBLICO) */
router.get("/:id/fotos", async (req, res) => {
  try {
    // Endpoint público - no requiere autenticación
    const http = buildHttpClient(ENV.FASTAPI_URL, () => "");
    const { data } = await http.get(`/canchas/${req.params.id}/fotos`);
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

/** POST /canchas - Crea una nueva cancha (REQUIERE AUTH) */
router.post("/", authMiddleware, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    // Requiere autenticación - dueño/admin/super_admin
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    const { data } = await http.post('/canchas', req.body);
    res.status(201).json({ ok: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

/** PATCH /canchas/:id - Actualiza una cancha (REQUIERE AUTH) */
router.patch("/:id", authMiddleware, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    // Requiere autenticación - dueño/admin/super_admin
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    const { data } = await http.patch(`/canchas/${req.params.id}`, req.body);
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

/** DELETE /canchas/:id - Elimina/archiva una cancha (REQUIERE AUTH) */
router.delete("/:id", authMiddleware, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    // Requiere autenticación - dueño/admin/super_admin
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    await http.delete(`/canchas/${req.params.id}`);
    res.status(204).json({ ok: true });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

/** POST /canchas/:id/fotos - Agrega foto a la cancha (REQUIERE AUTH) */
router.post("/:id/fotos", authMiddleware, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    // Requiere autenticación - dueño/admin/super_admin
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    const { data } = await http.post(`/canchas/${req.params.id}/fotos`, req.body);
    res.status(201).json({ ok: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

/** DELETE /canchas/:id/fotos/:fotoId - Elimina una foto (REQUIERE AUTH) */
router.delete("/:id/fotos/:fotoId", authMiddleware, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    // Requiere autenticación - dueño/admin/super_admin
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    await http.delete(`/canchas/${req.params.id}/fotos/${req.params.fotoId}`);
    res.status(204).json({ ok: true });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ 
      ok: false, 
      error: { code: error.response?.status || 500, message: error.message } 
    });
  }
});

export default router;
