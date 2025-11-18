import { Request, Response } from 'express';
import { reservaServiceNew } from './reservas.service.new';

/**
 * Controlador para manejar las peticiones de reservas
 * Actúa como intermediario entre las rutas Express y el servicio de FastAPI
 */
export class ReservaControllerNew {
  /**
   * GET /api/v1/reservas/mias
   * Obtiene todas las reservas del usuario autenticado
   */
  async getMisReservas(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 [ReservaControllerNew] GET /mias - Solicitando reservas del usuario');

      // Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('❌ [ReservaControllerNew] Token no proporcionado');
        res.status(401).json({ 
          error: 'No autenticado',
          message: 'Token de autenticación requerido' 
        });
        return;
      }

      const token = authHeader.substring(7); // Remover "Bearer "

      // Verificar que req.user existe (agregado por authMiddleware)
      if (!req.user) {
        console.error('❌ [ReservaControllerNew] Usuario no autenticado');
        res.status(401).json({ 
          error: 'No autenticado',
          message: 'Usuario no autenticado' 
        });
        return;
      }

      console.log('👤 [ReservaControllerNew] Usuario autenticado:', {
        id: req.user.id_usuario,
        email: req.user.email,
        role: req.user.rol
      });

      // Llamar al servicio para obtener las reservas
      const reservas = await reservaServiceNew.getMisReservas(token);

      console.log(`✅ [ReservaControllerNew] ${reservas.length} reservas encontradas`);

      // Retornar las reservas
      res.status(200).json(reservas);

    } catch (error: any) {
      console.error('❌ [ReservaControllerNew] Error en getMisReservas:', error.message);
      
      res.status(error.response?.status || 500).json({
        error: 'Error al obtener reservas',
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/v1/reservas
   * Crea una nueva reserva para el usuario autenticado
   * 
   * Body esperado:
   * {
   *   "id_cancha": 1,
   *   "fecha": "2025-11-20",
   *   "inicio": "18:00",
   *   "fin": "19:00",
   *   "notas": "Partido amistoso" (opcional)
   * }
   */
  async crearReserva(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 [ReservaControllerNew] POST / - Creando nueva reserva');
      console.log('📦 [ReservaControllerNew] Body recibido:', req.body);

      // Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('❌ [ReservaControllerNew] Token no proporcionado');
        res.status(401).json({ 
          error: 'No autenticado',
          message: 'Token de autenticación requerido' 
        });
        return;
      }

      const token = authHeader.substring(7);

      // Verificar que req.user existe
      if (!req.user) {
        console.error('❌ [ReservaControllerNew] Usuario no autenticado');
        res.status(401).json({ 
          error: 'No autenticado',
          message: 'Usuario no autenticado' 
        });
        return;
      }

      console.log('👤 [ReservaControllerNew] Usuario autenticado:', {
        id: req.user.id_usuario,
        email: req.user.email,
        role: req.user.rol
      });

      // Extraer datos del body
      const { id_cancha, fecha, inicio, fin, notas } = req.body;

      // Validar campos requeridos
      if (!id_cancha) {
        console.error('❌ [ReservaControllerNew] Campo requerido: id_cancha');
        res.status(400).json({ 
          error: 'Validación fallida',
          message: 'El campo id_cancha es requerido' 
        });
        return;
      }

      if (!fecha) {
        console.error('❌ [ReservaControllerNew] Campo requerido: fecha');
        res.status(400).json({ 
          error: 'Validación fallida',
          message: 'El campo fecha es requerido' 
        });
        return;
      }

      if (!inicio) {
        console.error('❌ [ReservaControllerNew] Campo requerido: inicio');
        res.status(400).json({ 
          error: 'Validación fallida',
          message: 'El campo inicio es requerido' 
        });
        return;
      }

      if (!fin) {
        console.error('❌ [ReservaControllerNew] Campo requerido: fin');
        res.status(400).json({ 
          error: 'Validación fallida',
          message: 'El campo fin es requerido' 
        });
        return;
      }

      // Validar formato de fecha (YYYY-MM-DD)
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        console.error('❌ [ReservaControllerNew] Formato de fecha inválido:', fecha);
        res.status(400).json({ 
          error: 'Validación fallida',
          message: 'El formato de fecha debe ser YYYY-MM-DD' 
        });
        return;
      }

      // Validar formato de hora (HH:MM)
      const horaRegex = /^\d{2}:\d{2}$/;
      if (!horaRegex.test(inicio)) {
        console.error('❌ [ReservaControllerNew] Formato de hora inicio inválido:', inicio);
        res.status(400).json({ 
          error: 'Validación fallida',
          message: 'El formato de inicio debe ser HH:MM' 
        });
        return;
      }

      if (!horaRegex.test(fin)) {
        console.error('❌ [ReservaControllerNew] Formato de hora fin inválido:', fin);
        res.status(400).json({ 
          error: 'Validación fallida',
          message: 'El formato de fin debe ser HH:MM' 
        });
        return;
      }

      // Preparar datos para FastAPI
      const reservaData = {
        fecha,
        inicio,
        fin,
        id_cancha: Number(id_cancha),
        notas: notas || undefined
      };

      console.log('📤 [ReservaControllerNew] Enviando a FastAPI:', reservaData);

      // Llamar al servicio para crear la reserva
      const reservaCreada = await reservaServiceNew.crearReserva(token, reservaData);

      console.log('✅ [ReservaControllerNew] Reserva creada exitosamente:', reservaCreada);

      // Retornar la reserva creada
      res.status(201).json(reservaCreada);

    } catch (error: any) {
      console.error('❌ [ReservaControllerNew] Error en crearReserva:', error.message);
      
      // Si el error es de validación (400), mantener el código
      const statusCode = error.message.includes('Validación') ? 400 : 
                         error.message.includes('No autenticado') ? 401 :
                         500;
      
      res.status(statusCode).json({
        error: 'Error al crear reserva',
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/v1/reservas/:id
   * Obtiene una reserva específica por ID
   */
  async getReservaById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`📥 [ReservaControllerNew] GET /:id - Obteniendo reserva ${id}`);

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ 
          error: 'No autenticado',
          message: 'Token de autenticación requerido' 
        });
        return;
      }

      const token = authHeader.substring(7);

      const reserva = await reservaServiceNew.getReservaById(token, Number(id));

      console.log('✅ [ReservaControllerNew] Reserva obtenida:', reserva);

      res.status(200).json(reserva);

    } catch (error: any) {
      console.error('❌ [ReservaControllerNew] Error en getReservaById:', error.message);
      
      res.status(error.response?.status || 500).json({
        error: 'Error al obtener reserva',
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * DELETE /api/v1/reservas/:id
   * Cancela una reserva
   */
  async cancelarReserva(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`📥 [ReservaControllerNew] DELETE /:id - Cancelando reserva ${id}`);

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ 
          error: 'No autenticado',
          message: 'Token de autenticación requerido' 
        });
        return;
      }

      const token = authHeader.substring(7);

      await reservaServiceNew.cancelarReserva(token, Number(id));

      console.log('✅ [ReservaControllerNew] Reserva cancelada exitosamente');

      res.status(200).json({ 
        message: 'Reserva cancelada exitosamente',
        id_reserva: Number(id)
      });

    } catch (error: any) {
      console.error('❌ [ReservaControllerNew] Error en cancelarReserva:', error.message);
      
      res.status(error.response?.status || 500).json({
        error: 'Error al cancelar reserva',
        message: error.message || 'Error interno del servidor'
      });
    }
  }
}

// Exportar instancia única
export const reservaControllerNew = new ReservaControllerNew();
