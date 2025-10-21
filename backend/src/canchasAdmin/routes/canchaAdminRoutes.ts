import { Router } from 'express';
import { CanchasAdminController } from '../interfaces/controllers/canchaAdminControllers';

/**
 * Rutas para la administración de canchas.
 *
 * Este router expone un único endpoint GET que permite listar las
 * canchas disponibles en el panel del administrador. Debe montarse
 * sobre la ruta base que corresponda a las canchas en la aplicación,
 * por ejemplo `app.use('/api/canchas', canchasAdminRouter);`. De este
 * modo la ruta final será `/api/canchas/admin`.
 */
const router = Router();
const controller = new CanchasAdminController();

// Obtener canchas administradas
router.get('/admin', (req, res) => controller.listar(req, res));

export default router;
