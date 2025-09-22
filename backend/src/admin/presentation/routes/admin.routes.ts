import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { AdminApiRepository } from "../../../admin/infraestructure/AdminApiRepository";
import { AsignarRol } from "../../../admin/application/AsignarRol";
import { ListUsers, GetUser, PatchUser, RemoveUser } from "../../../admin/application/UsersUseCases";
import { AdminController } from "../../../admin/presentation/controllers/admin.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";

/**
 * Router para endpoints administrativos.
 * Maneja la gestión de usuarios y asignación de roles.
 *
 * Todos los endpoints requieren rol admin o superadmin.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new AdminApiRepository(http);
  return new AdminController(
    new AsignarRol(repo),
    new ListUsers(repo),
    new GetUser(repo),
    new PatchUser(repo),
    new RemoveUser(repo)
  );
};

// === Endpoints de Usuarios ===
// Requieren rol admin o superadmin para acceso

/** GET /admin/users - Lista usuarios con paginación y filtros */
router.get("/users", requireRole("admin", "superadmin"), (req, res) => ctrl(req).list(req, res));

/** GET /admin/users/:id - Obtiene usuario específico */
router.get("/users/:id", requireRole("admin", "superadmin"), (req, res) => ctrl(req).get(req, res));

/** PATCH /admin/users/:id - Actualiza datos de usuario */
router.patch("/users/:id", requireRole("admin", "superadmin"), (req, res) => ctrl(req).patch(req, res));

/** DELETE /admin/users/:id - Elimina usuario */
router.delete("/users/:id", requireRole("admin", "superadmin"), (req, res) => ctrl(req).remove(req, res));

// === Endpoints de Roles ===

/** POST /admin/users/:id/role - Asigna rol a usuario (con validación de permisos) */
router.post("/users/:id/role", requireRole("admin", "superadmin"), (req, res) => ctrl(req).asignarRol(req, res));

// === Endpoint de Prueba de Conectividad ===
/** GET /admin/test-api - Prueba conectividad REAL con la API de usuarios */
router.get("/test-api", async (req, res) => {
  try {
    const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
    
    let response;
    let endpoint_tested = "";
    let endpoints_found = [];
    let success = false;
    
    // Probar endpoints reales que existen en tu API
    const endpointsToTest = [
      '/api/v1/usuarios',
      '/api/v1/healthz',
      '/api/v1/version'
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
      message: success ? "API de usuarios funcionando" : "Algunos endpoints con errores",
      fastapi_url: ENV.FASTAPI_URL,
      endpoint_tested,
      status: response?.status || 0,
      module: "admin",
      endpoints_found,
      success,
      real_endpoints: [
        "GET /api/v1/usuarios",
        "GET /api/v1/usuarios/{id_usuario}",
        "PATCH /api/v1/usuarios/{id_usuario}",
        "DELETE /api/v1/usuarios/{id_usuario}",
        "POST /api/v1/admin/usuarios/{id_usuario}/rol"
      ]
    });
    
  } catch (error: any) {
    res.json({
      ok: false,
      message: "Error conectando con FastAPI",
      fastapi_url: ENV.FASTAPI_URL,
      module: "admin",
      error: error.message
    });
  }
});

export default router;
