// src/horarios/route/horariosRoutes.ts
import { Router } from "express";
import { HorariosController } from "../interfaces/controllers/horariosControllers";

const router = Router();
const controller = new HorariosController();

/**
 * Montaje en app:
 * app.use("/api/horarios", horariosRouter)
 */

// CRUD
router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.delete("/:id", controller.eliminar);

// Activar / Desactivar
router.patch("/:id/activar", controller.activar);
router.patch("/:id/desactivar", controller.desactivar);

export default router;
