// src/usuario/route/usuarioRoute.ts
import { Router } from "express";
import { UsuarioController } from "../interfaces/controllers/usuarioControllers";

const router = Router();
const controller = new UsuarioController();

/**
 * Montar en app:
 * app.use("/api/usuarios", usuarioRouter)
 */

// Crear
router.post("/", controller.crear);

// Listar (filtros: q, rol, esta_activo, verificado, page, size)
router.get("/", controller.listar);

// Obtener uno por id
router.get("/:id", controller.obtener);

// Actualizar por id
router.put("/:id", controller.actualizar);

// Eliminar por id
router.delete("/:id", controller.eliminar);

// Activar/Desactivar/Verificar
router.patch("/:id/activar", controller.activar);
router.patch("/:id/desactivar", controller.desactivar);
router.patch("/:id/verificar", controller.verificar);

/** GET /usuarios/status - Verifica estado y conectividad del módulo usuarios */
router.get("/status", async (req, res) => {
  try {
    // Hacer una petición simple a FastAPI para verificar conectividad
    const axios = require('axios');
    const apiUrl = process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me';
    
    const response = await axios.get(`${apiUrl}/usuarios`, {
      params: { page: 1, page_size: 1 },
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({
      ok: true,
      module: "usuarios",
      message: "Módulo de usuarios funcionando correctamente",
      fastapi_connection: "✅ Connected",
      fastapi_url: apiUrl,
      fastapi_response_time: `${Date.now() - Date.now()}ms`,
      endpoints: {
        list: "GET /api/usuarios",
        get: "GET /api/usuarios/:id", 
        create: "POST /api/usuarios",
        update: "PUT /api/usuarios/:id",
        patch: "PATCH /api/usuarios/:id",
        delete: "DELETE /api/usuarios/:id",
        activate: "PATCH /api/usuarios/:id/activar",
        deactivate: "PATCH /api/usuarios/:id/desactivar",
        verify: "PATCH /api/usuarios/:id/verificar"
      },
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      module: "usuarios",
      message: "Error en módulo de usuarios",
      fastapi_connection: "❌ Error",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
