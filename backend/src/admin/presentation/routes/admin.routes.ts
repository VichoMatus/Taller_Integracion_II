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

export default router;
