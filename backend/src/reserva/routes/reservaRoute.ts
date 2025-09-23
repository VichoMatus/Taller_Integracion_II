// src/interfaces/routes/reservaRoutes.ts
import { Router } from "express";
import { ReservaController } from "../interfaces/controllers/reservaControllers";

const router = Router();
const controller = new ReservaController();

/**
 * RUTAS DE RESERVAS
 * (Montar en app con: app.use('/api/reservas', router); )
 */

// Crear reserva
router.post("/", controller.crear);

// Listar reservas (query: id_usuario, id_cancha, estado, desde, hasta, page, size)
router.get("/", controller.listar);

// Obtener una reserva por ID
router.get("/:id", controller.obtener);

// Actualizar una reserva (horario / notas)
router.put("/:id", controller.actualizar);

// Cancelar
router.patch("/:id/cancelar", controller.cancelar);

// Confirmar
router.patch("/:id/confirmar", controller.confirmar);

// Disponibilidad de una cancha
router.get("/disponibilidad", controller.disponibilidad);

export default router;
