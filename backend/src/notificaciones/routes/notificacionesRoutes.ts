// src/notificacion/route/notificacionRoute.ts
import { Router } from "express";
import { NotificacionController } from "../interfaces/controllers/notificacionesControllers";

const router = Router();
const controller = new NotificacionController();

// Crear notificación
router.post("/", controller.crear);

// Listar (filtros: id_usuario, estado, tipo, page, size)
router.get("/", controller.listar);

// Obtener una
router.get("/:id", controller.obtener);

// Actualizar
router.put("/:id", controller.actualizar);

// Eliminar
router.delete("/:id", controller.eliminar);

// Marcar como leída una notificación (CAMBIADO DE PATCH A POST)
router.post("/:id/leer", controller.marcarLeida);

// Marcar todas como leídas (CAMBIADO DE PATCH A POST)
router.post("/leer-todas", controller.marcarTodasLeidas);

// Contar no leídas
router.get("/no-leidas", controller.contarNoLeidas);

export default router;