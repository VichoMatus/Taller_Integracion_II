import { Router } from 'express';
import { SuperAdminController } from '../interfaces/controllers/superAdminController';

// Rutas para el módulo SuperAdmin que consume la API FastAPI hosteada
const router = Router();
const controller = new SuperAdminController();

// Rutas de autenticación
router.post('/auth/login', controller.login);
router.post('/auth/logout', controller.logout);

// Rutas de gestión de usuarios
router.get('/users', controller.getUsers);
router.get('/users/:id', controller.getUserById);
router.patch('/users/:id', controller.updateUser);
router.delete('/users/:id', controller.deleteUser);

// Rutas de gestión de complejos deportivos
router.get('/complejos', controller.getComplejos);
router.get('/complejos/:id', controller.getComplejoById);
router.get('/complejos/:id/canchas', controller.getComplejoCanchas);

// Rutas específicas de SuperAdmin
router.post('/system/parameters', controller.updateSystemParameters);
router.get('/system/statistics', controller.getSystemStatistics);
router.get('/system/logs', controller.getSystemLogs);

// Rutas de dashboard y utilidades
router.get('/dashboard', controller.getDashboard);
router.get('/search', controller.globalSearch);

export default router;