// src/interfaces/routes/resenaRoutes.ts
import { Router } from "express";
import { ResenaController } from "../interfaces/controllers/resenaControllers";

const router = Router();
const controller = new ResenaController();

/**
 * Montar con: app.use("/api/resenas", router)
 */

// Crear
router.post("/", controller.crear);

// Listar (filtros: id_usuario, id_cancha, calificacion_min, calificacion_max, page, size)
router.get("/", controller.listar);

// Obtener una
router.get("/:id", controller.obtener);

// Actualizar
router.put("/:id", controller.actualizar);

// Eliminar
router.delete("/:id", controller.eliminar);

// Promedio por cancha
router.get("/promedio", controller.promedio);

export default router;
