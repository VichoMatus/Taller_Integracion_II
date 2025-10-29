import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { CanchaApiRepository } from "../../infrastructure/CanchaApiRepository";
import { 
  ListCanchas, 
  GetCancha, 
  CreateCancha, 
  UpdateCancha, 
  DeleteCancha,
  CambiarEstadoCancha,
  GetCanchasDisponibles
} from "../../application/CanchasUseCases";
import { CanchasController } from "../controllers/canchas.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

/**
 * Router para endpoints de canchas.
 * Maneja la gestión completa de canchas deportivas.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new CanchaApiRepository(http);
  return new CanchasController(
    new ListCanchas(repo),
    new GetCancha(repo),
    new CreateCancha(repo),
    new UpdateCancha(repo),
    new DeleteCancha(repo),
    new CambiarEstadoCancha(repo),
    new GetCanchasDisponibles(repo)
  );
};

// === Endpoints Públicos (solo lectura) ===

/** GET /canchas - Lista canchas con filtros (público) */
router.get("/", (req, res) => ctrl(req).list(req, res));

/** GET /canchas/disponibles - Obtiene canchas disponibles en período (público) */
router.get("/disponibles", (req, res) => ctrl(req).getDisponibles(req, res));

/** GET /canchas/:id - Obtiene cancha específica (público) */
router.get("/:id", (req, res) => ctrl(req).get(req, res));

// === Endpoints Administrativos ===
// Requieren rol admin o super_admin

/** POST /canchas - Crea nueva cancha */
router.post("/", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).create(req, res));

/** PATCH /canchas/:id - Actualiza cancha */
router.patch("/:id", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).update(req, res));

/** DELETE /canchas/:id - Elimina cancha */
router.delete("/:id", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).delete(req, res));

/** PATCH /canchas/:id/estado - Cambia estado de cancha */
router.patch("/:id/estado", authMiddleware, requireRole("admin", "super_admin"), (req, res) => ctrl(req).cambiarEstado(req, res));

export default router;
