/**
 * CONFIGURACIÓN DE RUTAS DEL MÓDULO SUPERADMIN
 * ============================================
 * 
 * Este archivo define todas las rutas HTTP disponibles para el módulo SuperAdmin.
 * Las rutas se configuran usando Express Router y se conectan con el controlador.
 * 
 * URL base: /api/super_admin
 * 
 * Uso desde el frontend:
 * - Hacer peticiones HTTP a estas rutas desde React/Next.js
 * - Usar librerías como axios o fetch
 * - Manejar respuestas en formato ApiResponse<T>
 * 
 * Ejemplo de uso:
 * ```typescript
 * // Desde el frontend React/Next.js
 * const response = await fetch('/api/super_admin/users?page=1&page_size=20');
 * const data: ApiResponse<User[]> = await response.json();
 * 
 * if (data.ok) {
 *   setUsers(data.data);
 * } else {
 *   setError(data.error);
 * }
 * ```
 */

import { Router } from 'express';
import { SuperAdminController } from '../interfaces/controllers/superAdminController';
import { authMiddleware } from '../../auth/middlewares/authMiddleware';
import { requireSuperAdmin } from '../guards/superAdminGuards';
import cambioRolRoutes from '../../cambioRol/routes/cambioRolRoutes';
import profileImageRoutes from './profileImageRoutes';
import profileImageGetRoutes from './profileImageGetRoutes';

// Crear router de Express y instancia del controlador
const router = Router();
const controller = new SuperAdminController();

/**
 * RUTAS DE AUTENTICACIÓN
 * ======================
 */
// POST /api/super_admin/auth/login - Iniciar sesión
router.post('/auth/login', controller.login);

// POST /api/super_admin/auth/logout - Cerrar sesión
router.post('/auth/logout', controller.logout);

/**
 * RUTAS DE GESTIÓN DE USUARIOS
 * ============================
 */
// GET /api/super_admin/users - Listar usuarios (con paginación y filtros)
router.get('/users', authMiddleware, requireSuperAdmin, controller.getUsers);

// GET /api/super_admin/users/:id - Obtener usuario específico
router.get('/users/:id', authMiddleware, requireSuperAdmin, controller.getUserById);

// PATCH /api/super_admin/users/:id - Actualizar datos de usuario
router.patch('/users/:id', authMiddleware, requireSuperAdmin, controller.updateUser);

// DELETE /api/super_admin/users/:id - Desactivar usuario
router.delete('/users/:id', authMiddleware, requireSuperAdmin, controller.deleteUser);

/**
 * RUTAS DE GESTIÓN DE COMPLEJOS DEPORTIVOS
 * ========================================
 */
// GET /api/super_admin/complejos - Listar complejos deportivos
router.get('/complejos', authMiddleware, requireSuperAdmin, controller.getComplejos);

// GET /api/super_admin/complejos/:id - Obtener complejo específico
router.get('/complejos/:id', authMiddleware, requireSuperAdmin, controller.getComplejoById);

// GET /api/super_admin/complejos/:id/canchas - Obtener canchas de un complejo
router.get('/complejos/:id/canchas', authMiddleware, requireSuperAdmin, controller.getComplejoCanchas);

/**
 * RUTAS ESPECÍFICAS DE SUPERADMIN
 * ===============================
 */
// POST /api/super_admin/system/parameters - Actualizar configuración del sistema
router.post('/system/parameters', authMiddleware, requireSuperAdmin, controller.updateSystemParameters);

// GET /api/super_admin/system/statistics - Obtener estadísticas del sistema
router.get('/system/statistics', authMiddleware, requireSuperAdmin, controller.getSystemStatistics);

// GET /api/super_admin/system/logs - Obtener logs del sistema
router.get('/system/logs', authMiddleware, requireSuperAdmin, controller.getSystemLogs);

/**
 * RUTAS DE ESTADÍSTICAS COMPLETAS
 * ===============================
 */
// GET /api/super_admin/estadisticas/completas - Estadísticas completas del sistema
router.get('/estadisticas/completas', authMiddleware, requireSuperAdmin, controller.getEstadisticasCompletas);

/**
 * RUTAS DE UTILIDADES Y DASHBOARD
 * ===============================
 */
// GET /api/super_admin/dashboard - Datos para el dashboard principal
router.get('/dashboard', authMiddleware, requireSuperAdmin, controller.getDashboard);

// GET /api/super_admin/search?q=term - Búsqueda global en el sistema
router.get('/search', authMiddleware, requireSuperAdmin, controller.globalSearch);

/**
 * RUTAS DE CAMBIO DE ROL
 * ======================
 * POST /api/super_admin/usuarios/:id_usuario/rol - Promover usuario a rol superior
 * POST /api/super_admin/usuarios/:id_usuario/rol/demote - Degradar usuario a rol inferior
 * 
 * Solo accesible para super_admin.
 */
router.use('/usuarios', authMiddleware, requireSuperAdmin, cambioRolRoutes);

// Rutas para pedir imagen de perfil de superadmin
router.use('/profile-image', profileImageGetRoutes);

export default router;