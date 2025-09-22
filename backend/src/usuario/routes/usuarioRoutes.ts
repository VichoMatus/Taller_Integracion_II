import { Router } from 'express';
import { UserController } from '../interfaces/controllers/usuarioControllers';

// Instancia de router y controlador
const router = Router();
const controller = new UserController();

/**
 * RUTAS DE AUTENTICACIÓN
 */
// POST /api/usuario/auth/login - Iniciar sesión
router.post('/auth/login', controller.login);

// POST /api/usuario/auth/logout - Cerrar sesión
router.post('/auth/logout', controller.logout);

/**
 * RUTAS DE PERFIL DE USUARIO
 */
// GET /api/usuario/profile - Obtener perfil
router.get('/profile', controller.getProfile);

// PATCH /api/usuario/profile - Actualizar perfil
router.patch('/profile', controller.updateProfile);

/**
 * RUTAS DE COMPLEJOS DEL USUARIO
 */
// GET /api/usuario/complejos - Listar complejos del usuario
router.get('/complejos', controller.getComplejos);

// GET /api/usuario/complejos/:id - Obtener complejo específico del usuario
router.get('/complejos/:id', controller.getComplejoById);

// GET /api/usuario/complejos/:id/canchas - Obtener canchas de un complejo
router.get('/complejos/:id/canchas', controller.getComplejoCanchas);

export default router;
