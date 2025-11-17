import { Router } from 'express';
import { reservaControllerNew } from './reservas.controller.new';
import { authMiddleware } from '../auth/middlewares/authMiddleware';

/**
 * Router de reservas - Implementación limpia y directa con FastAPI
 * 
 * Rutas disponibles:
 * - GET  /api/v1/reservas/mias      → Obtener mis reservas (usuario autenticado)
 * - POST /api/v1/reservas           → Crear nueva reserva
 * - GET  /api/v1/reservas/:id       → Obtener reserva por ID
 * - DELETE /api/v1/reservas/:id     → Cancelar reserva
 */

const router = Router();

// ============================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// ============================================

/**
 * GET /api/v1/reservas/mias
 * Obtiene todas las reservas del usuario autenticado
 * 
 * Headers requeridos:
 * - Authorization: Bearer <token>
 * 
 * Respuesta (200 OK):
 * [
 *   {
 *     "id_reserva": 0,
 *     "id_usuario": 0,
 *     "id_cancha": 0,
 *     "fecha_reserva": "2025-11-17",
 *     "hora_inicio": "string",
 *     "hora_fin": "string",
 *     "estado": "pendiente",
 *     "precio_total": 0,
 *     "notas": "string"
 *   }
 * ]
 */
router.get(
  '/mias',
  authMiddleware,
  (req, res) => reservaControllerNew.getMisReservas(req, res)
);

/**
 * POST /api/v1/reservas
 * Crea una nueva reserva en estado "pendiente"
 * 
 * Headers requeridos:
 * - Authorization: Bearer <token>
 * - Content-Type: application/json
 * 
 * Body requerido:
 * {
 *   "fecha": "2025-10-21",
 *   "fin": "20:30",
 *   "id_cancha": 1,
 *   "inicio": "19:00",
 *   "notas": "Partido amistoso" (opcional)
 * }
 * 
 * Respuesta (201 Created):
 * {
 *   "id_reserva": 0,
 *   "id_usuario": 0,
 *   "id_cancha": 0,
 *   "fecha_reserva": "2025-11-17",
 *   "hora_inicio": "string",
 *   "hora_fin": "string",
 *   "estado": "pendiente",
 *   "precio_total": 0,
 *   "notas": "string"
 * }
 * 
 * Respuestas de error:
 * - 400: Validación fallida / sin disponibilidad
 * - 401: No autenticado
 * - 422: Validation Error
 */
router.post(
  '/',
  authMiddleware,
  (req, res) => reservaControllerNew.crearReserva(req, res)
);

/**
 * GET /api/v1/reservas/:id
 * Obtiene una reserva específica por ID
 * 
 * Headers requeridos:
 * - Authorization: Bearer <token>
 * 
 * Respuesta (200 OK):
 * {
 *   "id_reserva": 1,
 *   "id_usuario": 6,
 *   "id_cancha": 28,
 *   ...
 * }
 */
router.get(
  '/:id',
  authMiddleware,
  (req, res) => reservaControllerNew.getReservaById(req, res)
);

/**
 * DELETE /api/v1/reservas/:id
 * Cancela una reserva (cambia estado o elimina según la API)
 * 
 * Headers requeridos:
 * - Authorization: Bearer <token>
 * 
 * Respuesta (200 OK):
 * {
 *   "message": "Reserva cancelada exitosamente",
 *   "id_reserva": 1
 * }
 */
router.delete(
  '/:id',
  authMiddleware,
  (req, res) => reservaControllerNew.cancelarReserva(req, res)
);

// ============================================
// HEALTH CHECK
// ============================================

/**
 * GET /api/v1/reservas/health
 * Verifica que el servicio de reservas está funcionando
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Reservas Service (NEW)',
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

console.log('✅ [ReservasRoutesNew] Router configurado exitosamente');
console.log('📋 [ReservasRoutesNew] Rutas disponibles:');
console.log('   - GET  /api/v1/reservas/mias');
console.log('   - POST /api/v1/reservas');
console.log('   - GET  /api/v1/reservas/:id');
console.log('   - DELETE /api/v1/reservas/:id');
console.log('   - GET  /api/v1/reservas/health');

export default router;
