// src/denuncias/route/denunciasRoutes.ts
import { Router } from "express";
import { DenunciasController } from "../interfaces/controllers/denunciasControllers";

const router = Router();
const controller = new DenunciasController();

/**
 * Montar en app:
 * app.use("/api/denuncias", denunciasRouter)
 */

// CRUD
router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.delete("/:id", controller.eliminar);

// Cambiar estado (ABIERTA | EN_REVISION | RESUELTA | RECHAZADA)
router.patch("/:id/estado", controller.cambiarEstado);

export default router;
