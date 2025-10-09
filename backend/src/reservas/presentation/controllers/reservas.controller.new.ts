import { Request, Response } from 'express';
import {
  ListReservas,
  GetMisReservas,
  CotizarReserva,
  CreateReserva,
  GetReserva,
  UpdateReserva,
  CancelarReserva,
  ConfirmarReserva,
  CheckInReserva,
  NoShowReserva
} from '../../application/ReservasUseCasesNew';

/**
 * Controlador para endpoints de reservas
 * Maneja todos los casos de uso relacionados con reservas de canchas
 */
export class ReservasControllerNew {
  constructor(
    private listReservasUC: ListReservas,
    private getMisReservasUC: GetMisReservas,
    private cotizarReservaUC: CotizarReserva,
    private createReservaUC: CreateReserva,
    private getReservaUC: GetReserva,
    private updateReservaUC: UpdateReserva,
    private cancelarReservaUC: CancelarReserva,
    private confirmarReservaUC: ConfirmarReserva,
    private checkInReservaUC: CheckInReserva,
    private noShowReservaUC: NoShowReserva
  ) {}

  /**
   * GET /reservas - Vista administrativa/owner con filtros (rango, estado)
   */
  listReservas = async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        pageSize = 20,
        usuarioId,
        canchaId,
        complejoId,
        estado,
        fechaDesde,
        fechaHasta,
        pagado,
        codigoConfirmacion
      } = req.query;

      const filters = {
        page: Number(page),
        pageSize: Number(pageSize),
        usuarioId: usuarioId ? Number(usuarioId) : undefined,
        canchaId: canchaId ? Number(canchaId) : undefined,
        complejoId: complejoId ? Number(complejoId) : undefined,
        estado: estado as any,
        fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
        fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
        pagado: pagado !== undefined ? pagado === 'true' : undefined,
        codigoConfirmacion: codigoConfirmacion as string
      };

      const result = await this.listReservasUC.execute(filters);

      res.json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / result.pageSize)
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * GET /reservas/mias - Reservas del usuario logueado
   */
  getMisReservas = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { incluir_pasadas = false } = req.query;
      const incluirPasadas = incluir_pasadas === 'true';

      const reservas = await this.getMisReservasUC.execute(userId, incluirPasadas);

      res.json({
        success: true,
        data: reservas,
        total: reservas.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * POST /reservas/cotizar - Calcula precio/fees y puede \"hold\" temporal
   */
  cotizarReserva = async (req: Request, res: Response) => {
    try {
      const { canchaId, fechaInicio, fechaFin, crearHold, holdDuracionMinutos } = req.body;

      const cotizacion = await this.cotizarReservaUC.execute({
        canchaId,
        fechaInicio,
        fechaFin,
        crearHold,
        holdDuracionMinutos
      });

      res.json({
        success: true,
        data: cotizacion
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * POST /reservas - Crea la reserva (tentativa o pagada)
   */
  createReserva = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { canchaId, fechaInicio, fechaFin, metodoPago, notas } = req.body;

      const reserva = await this.createReservaUC.execute({
        usuarioId: userId,
        canchaId,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        metodoPago,
        notas
      });

      res.status(201).json({
        success: true,
        data: reserva,
        message: 'Reserva creada exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * GET /reservas/:id - Detalle de la reserva
   */
  getReserva = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reserva = await this.getReservaUC.execute(Number(id));

      res.json({
        success: true,
        data: reserva
      });
    } catch (error: any) {
      const status = error.message.includes('no encontrado') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * PATCH /reservas/:id - Reprograma/edita (si política lo permite)
   */
  updateReserva = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Convertir fechas si vienen como strings
      if (updateData.fechaInicio) {
        updateData.fechaInicio = new Date(updateData.fechaInicio);
      }
      if (updateData.fechaFin) {
        updateData.fechaFin = new Date(updateData.fechaFin);
      }

      const reserva = await this.updateReservaUC.execute(Number(id), updateData);

      res.json({
        success: true,
        data: reserva,
        message: 'Reserva actualizada exitosamente'
      });
    } catch (error: any) {
      const status = error.message.includes('no encontrado') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * POST /reservas/:id/cancelar - Cancela (aplica política/cargo)
   */
  cancelarReserva = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const reserva = await this.cancelarReservaUC.execute(Number(id), motivo);

      res.json({
        success: true,
        data: reserva,
        message: 'Reserva cancelada exitosamente'
      });
    } catch (error: any) {
      const status = error.message.includes('no encontrado') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * POST /reservas/:id/confirmar - Marca como confirmada (post-pago)
   */
  confirmarReserva = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { metodoPago } = req.body;

      if (!metodoPago) {
        return res.status(400).json({
          success: false,
          message: 'metodoPago es requerido'
        });
      }

      const reserva = await this.confirmarReservaUC.execute(Number(id), metodoPago);

      res.json({
        success: true,
        data: reserva,
        message: 'Reserva confirmada exitosamente'
      });
    } catch (error: any) {
      const status = error.message.includes('no encontrado') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * POST /reservas/:id/check-in - Marca asistencia
   */
  checkIn = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reserva = await this.checkInReservaUC.execute(Number(id));

      res.json({
        success: true,
        data: reserva,
        message: 'Check-in registrado exitosamente'
      });
    } catch (error: any) {
      const status = error.message.includes('no encontrado') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * POST /reservas/:id/no-show - Marca inasistencia
   */
  noShow = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { observaciones } = req.body;

      const reserva = await this.noShowReservaUC.execute(Number(id), observaciones);

      res.json({
        success: true,
        data: reserva,
        message: 'No-show registrado exitosamente'
      });
    } catch (error: any) {
      const status = error.message.includes('no encontrado') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };
}