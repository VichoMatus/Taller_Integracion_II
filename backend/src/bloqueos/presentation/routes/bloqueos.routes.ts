import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { BloqueoApiRepository } from "../../infrastructure/BloqueoApiRepository";
import { 
  ListBloqueos, 
  GetBloqueo, 
  CreateBloqueo, 
  UpdateBloqueo, 
  DeleteBloqueo,
  VerificarConflictoBloqueo,
  GetBloqueosActivos,
  GetBloqueosByCreador,
  ActivarBloqueo,
  DesactivarBloqueo
} from "../../application/BloqueosUseCases";
import { BloqueosController } from "../controllers/bloqueos.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";

/**
 * Router para endpoints de bloqueos.
 * Maneja la gestión completa de bloqueos de canchas.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new BloqueoApiRepository(http);
  return new BloqueosController(
    new ListBloqueos(repo),
    new GetBloqueo(repo),
    new CreateBloqueo(repo),
    new UpdateBloqueo(repo),
    new DeleteBloqueo(repo),
    new VerificarConflictoBloqueo(repo),
    new GetBloqueosActivos(repo),
    new GetBloqueosByCreador(repo),
    new ActivarBloqueo(repo),
    new DesactivarBloqueo(repo)
  );
};

// === Endpoints Públicos ===

/** POST /bloqueos/verificar-conflicto - Verifica conflictos entre bloqueos (público) */
router.post("/verificar-conflicto", (req, res) => ctrl(req).verificarConflicto(req, res));

/** GET /bloqueos/activos/:canchaId - Obtiene bloqueos activos de una cancha (público) */
router.get("/activos/:canchaId", (req, res) => ctrl(req).getActivos(req, res));

// === Endpoints de Dueños y Administradores ===
// Requieren autenticación para gestionar bloqueos

/** GET /bloqueos/creador/:creadoPorId - Obtiene bloqueos de un creador */
router.get("/creador/:creadoPorId", (req, res) => ctrl(req).getByCreador(req, res));

/** POST /bloqueos - Crea nuevo bloqueo */
router.post("/", (req, res) => ctrl(req).create(req, res));

/** GET /bloqueos/:id - Obtiene bloqueo específico */
router.get("/:id", (req, res) => ctrl(req).get(req, res));

/** PATCH /bloqueos/:id - Actualiza bloqueo */
router.patch("/:id", (req, res) => ctrl(req).update(req, res));

/** POST /bloqueos/:id/activar - Activa bloqueo */
router.post("/:id/activar", (req, res) => ctrl(req).activar(req, res));

/** POST /bloqueos/:id/desactivar - Desactiva bloqueo */
router.post("/:id/desactivar", (req, res) => ctrl(req).desactivar(req, res));

// === Endpoints Administrativos ===
// Requieren rol admin o superadmin

/** GET /bloqueos - Lista todos los bloqueos con filtros */
router.get("/", requireRole("admin", "superadmin"), (req, res) => ctrl(req).list(req, res));

/** DELETE /bloqueos/:id - Elimina bloqueo */
router.delete("/:id", requireRole("admin", "superadmin"), (req, res) => ctrl(req).delete(req, res));

export default router;
