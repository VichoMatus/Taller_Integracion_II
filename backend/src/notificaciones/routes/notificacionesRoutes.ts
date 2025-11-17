// src/notificacion/route/notificacionRoute.ts
import { Router } from "express";
import { NotificacionController } from "../interfaces/controllers/notificacionesControllers";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";

const router = Router();
const controller = new NotificacionController();

/**
 * Montar en app:
 * app.use("/api/notificaciones", notificacionRouter)
 * 
 * Endpoints basados en la API real de FastAPI/Python:
 * - GET /notificaciones - Listar notificaciones del usuario autenticado
 * - POST /notificaciones/:id/leer - Marcar una notificación como leída
 * - POST /notificaciones/leer-todas - Marcar todas como leídas
 * - POST /notificaciones - Crear notificación (admin/backend)
 * - POST /notificaciones/email - Crear y enviar por email
 */

// --------- APP MÓVIL: listar y marcar leídas -----------------

// Listar notificaciones del usuario autenticado
// Query param: solo_no_leidas=true para filtrar solo no leídas
router.get("/", authMiddleware, controller.listar);

// Marcar una notificación como leída
router.post("/:id/leer", authMiddleware, controller.marcarLeida);

// Marcar todas las notificaciones como leídas para el usuario actual
router.post("/leer-todas", authMiddleware, controller.marcarTodasLeidas);

// --------- BACKEND/ADMIN: crear notificaciones --------

// Crear notificación in-app (para uso del backend o admin)
router.post("/", controller.crear);

// Crear notificación y enviar correo al usuario
router.post("/email", controller.crearYEnviarEmail);

export default router;
