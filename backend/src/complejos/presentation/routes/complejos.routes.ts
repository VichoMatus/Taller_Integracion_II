import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { ComplejoApiRepository } from "../../infrastructure/ComplejoApiRepository";
import { 
  ListComplejos, 
  GetComplejo, 
  CreateComplejo, 
  UpdateComplejo, 
  DeleteComplejo,
  CambiarEstadoComplejo,
  GetComplejosByDuenio
} from "../../application/ComplejosUseCases";
import { ComplejosController } from "../controllers/complejos.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

/**
 * Router para endpoints de complejos deportivos.
 * Maneja la gestión completa de establecimientos deportivos.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new ComplejoApiRepository(http);
  return new ComplejosController(
    new ListComplejos(repo),
    new GetComplejo(repo),
    new CreateComplejo(repo),
    new UpdateComplejo(repo),
    new DeleteComplejo(repo),
    new CambiarEstadoComplejo(repo),
    new GetComplejosByDuenio(repo)
  );
};

// === Endpoints Públicos (solo lectura) ===

/** GET /complejos - Lista complejos con filtros (público) */
router.get("/", (req, res) => ctrl(req).list(req, res));

/** GET /complejos/:id - Obtiene complejo específico (público) */
router.get("/:id", (req, res) => ctrl(req).get(req, res));

// === Endpoints para Dueños ===
// Requieren autenticación pero permiten a dueños gestionar sus propios complejos

/** GET /complejos/duenio/:duenioId - Obtiene complejos de un dueño */
router.get("/duenio/:duenioId", authMiddleware, requireRole("admin", "superadmin"), (req, res) => ctrl(req).getByDuenio(req, res));

// === Endpoints Administrativos ===
// Requieren rol admin o superadmin

/** POST /complejos - Crea nuevo complejo */
router.post("/", authMiddleware, requireRole("admin", "superadmin"), (req, res) => ctrl(req).create(req, res));

/** PATCH /complejos/:id - Actualiza complejo */
router.patch("/:id", authMiddleware, requireRole("admin", "superadmin"), (req, res) => ctrl(req).update(req, res));

/** DELETE /complejos/:id - Elimina complejo */
router.delete("/:id", authMiddleware, requireRole("admin", "superadmin"), (req, res) => ctrl(req).delete(req, res));

/** PATCH /complejos/:id/estado - Cambia estado de complejo */
router.patch("/:id/estado", authMiddleware, requireRole("admin", "superadmin"), (req, res) => ctrl(req).cambiarEstado(req, res));

export default router;
