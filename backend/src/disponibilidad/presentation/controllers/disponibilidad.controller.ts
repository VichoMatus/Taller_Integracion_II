import { Request, Response } from 'express';
import {
  GetDisponibilidad,
  ListHorarios,
  GetHorario,
  CreateHorario,
  UpdateHorario,
  DeleteHorario,
  ListBloqueos,
  GetBloqueo,
  CreateBloqueo,
  DeleteBloqueo
} from '../../application/DisponibilidadUseCases';

/**
 * Controlador para endpoints de disponibilidad, horarios y bloqueos
 */
export class DisponibilidadController {
  constructor(
    private getDisponibilidadUC: GetDisponibilidad,
    private listHorariosUC: ListHorarios,
    private getHorarioUC: GetHorario,
    private createHorarioUC: CreateHorario,
    private updateHorarioUC: UpdateHorario,
    private deleteHorarioUC: DeleteHorario,
    private listBloqueosUC: ListBloqueos,
    private getBloqueoUC: GetBloqueo,
    private createBloqueoUC: CreateBloqueo,
    private deleteBloqueosUC: DeleteBloqueo
  ) {}

  // === DISPONIBILIDAD ===

  /**
   * GET /disponibilidad - Consultar slots disponibles
   */
  getDisponibilidad = async (req: Request, res: Response) => {
    try {
      const { id_complejo, id_cancha, fecha_inicio, fecha_fin, solo_disponibles } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'fecha_inicio y fecha_fin son requeridas'
        });
      }

      const consulta = {
        id_complejo: id_complejo ? Number(id_complejo) : undefined,
        id_cancha: id_cancha ? Number(id_cancha) : undefined,
        fecha_inicio: fecha_inicio as string,
        fecha_fin: fecha_fin as string,
        solo_disponibles: solo_disponibles === 'true'
      };

      const slots = await this.getDisponibilidadUC.execute(consulta);

      res.json({
        success: true,
        data: slots,
        total: slots.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // === HORARIOS ===

  /**
   * GET /horarios - Listar horarios
   */
  listHorarios = async (req: Request, res: Response) => {
    try {
      const { id_complejo, id_cancha } = req.query;

      if (!id_complejo) {
        return res.status(400).json({
          success: false,
          message: 'id_complejo es requerido'
        });
      }

      const horarios = await this.listHorariosUC.execute(
        Number(id_complejo),
        id_cancha ? Number(id_cancha) : undefined
      );

      res.json({
        success: true,
        data: horarios,
        total: horarios.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * GET /horarios/:id - Obtener horario específico
   */
  getHorario = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const horario = await this.getHorarioUC.execute(Number(id));

      res.json({
        success: true,
        data: horario
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
   * POST /horarios - Crear horario
   */
  createHorario = async (req: Request, res: Response) => {
    try {
      const { id_complejo, id_cancha, dia_semana, hora_apertura, hora_cierre } = req.body;

      const horario = await this.createHorarioUC.execute({
        id_complejo,
        id_cancha,
        dia_semana,
        hora_apertura,
        hora_cierre
      });

      res.status(201).json({
        success: true,
        data: horario,
        message: 'Horario creado exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * PATCH /horarios/:id - Actualizar horario
   */
  updateHorario = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const horario = await this.updateHorarioUC.execute(Number(id), updateData);

      res.json({
        success: true,
        data: horario,
        message: 'Horario actualizado exitosamente'
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
   * DELETE /horarios/:id - Eliminar horario
   */
  deleteHorario = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.deleteHorarioUC.execute(Number(id));

      res.json({
        success: true,
        message: 'Horario eliminado exitosamente'
      });
    } catch (error: any) {
      const status = error.message.includes('no encontrado') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  // === BLOQUEOS ===

  /**
   * GET /bloqueos - Listar bloqueos
   */
  listBloqueos = async (req: Request, res: Response) => {
    try {
      const { id_complejo, id_cancha } = req.query;

      if (!id_complejo) {
        return res.status(400).json({
          success: false,
          message: 'id_complejo es requerido'
        });
      }

      const bloqueos = await this.listBloqueosUC.execute(
        Number(id_complejo),
        id_cancha ? Number(id_cancha) : undefined
      );

      res.json({
        success: true,
        data: bloqueos,
        total: bloqueos.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * GET /bloqueos/:id - Obtener bloqueo específico
   */
  getBloqueo = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const bloqueo = await this.getBloqueoUC.execute(Number(id));

      res.json({
        success: true,
        data: bloqueo
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
   * POST /bloqueos - Crear bloqueo
   */
  createBloqueo = async (req: Request, res: Response) => {
    try {
      const { id_cancha, fecha_inicio, fecha_fin, motivo, es_recurrente, recurrencia_tipo } = req.body;
      
      // Obtener usuario del token
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const bloqueo = await this.createBloqueoUC.execute({
        id_cancha,
        fecha_inicio,
        fecha_fin,
        motivo,
        es_recurrente,
        recurrencia_tipo
      }, userId);

      res.status(201).json({
        success: true,
        data: bloqueo,
        message: 'Bloqueo creado exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * DELETE /bloqueos/:id - Eliminar bloqueo
   */
  deleteBloqueo = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.deleteBloqueosUC.execute(Number(id));

      res.json({
        success: true,
        message: 'Bloqueo eliminado exitosamente'
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