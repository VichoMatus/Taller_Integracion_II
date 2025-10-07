// src/promociones/route/promocionesRoutes.ts
import { Router } from "express";
import { PromocionesController } from "../interfaces/controllers/promocionesControllers";

const router = Router();
const controller = new PromocionesController();

/**
 * Montar en app:
 * app.use("/api/promociones", promocionesRouter)
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

// Evaluar descuento con un precio base
router.post("/evaluar", controller.evaluar);

export default router;
