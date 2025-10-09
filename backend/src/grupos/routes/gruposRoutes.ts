// src/grupos/route/gruposRoutes.ts
import { Router } from "express";
import { GruposController } from "../interfaces/controllers/gruposControllers";

const router = Router();
const controller = new GruposController();

/**
 * Montar en app:
 * app.use("/api/grupos", gruposRouter)
 */

// ===== Grupos =====
router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.delete("/:id", controller.eliminar);

// ===== Miembros =====
router.get("/:id/miembros", controller.listarMiembros);
router.post("/:id/miembros", controller.agregarMiembro);
router.put("/:id/miembros/:id_miembro", controller.actualizarMiembro);
router.delete("/:id/miembros/:id_miembro", controller.eliminarMiembro);

// ===== Ownership =====
router.patch("/:id/transferir-owner", controller.transferirOwner);

export default router;
