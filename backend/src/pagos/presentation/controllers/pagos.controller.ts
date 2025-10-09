import { Request, Response } from 'express';
import {
  ListPagos,
  GetPago,
  GetPagosByReserva,
  CreatePago,
  UpdatePago,
  ProcesarPago,
  ConfirmarPago,
  ReembolsarPago
} from '../../application/PagosUseCases';

/**
 * Controlador para endpoints de pagos
 */
export class PagosController {
  constructor(
    private listPagosUC: ListPagos,
    private getPagoUC: GetPago,
    private getPagosByReservaUC: GetPagosByReserva,
    private createPagoUC: CreatePago,
    private updatePagoUC: UpdatePago,
    private procesarPagoUC: ProcesarPago,
    private confirmarPagoUC: ConfirmarPago,
    private reembolsarPagoUC: ReembolsarPago
  ) {}

  /**
   * GET /pagos - Listar pagos
   */
  listPagos = async (req: Request, res: Response) => {
    try {
      const {
        id_reserva,
        proveedor,
        estado,
        fecha_inicio,
        fecha_fin,
        page = 1,
        page_size = 20
      } = req.query;

      const params = {
        id_reserva: id_reserva ? Number(id_reserva) : undefined,
        proveedor: proveedor as string,
        estado: estado as any,
        fecha_inicio: fecha_inicio as string,
        fecha_fin: fecha_fin as string,
        page: Number(page),
        page_size: Number(page_size)
      };

      const result = await this.listPagosUC.execute(params);

      res.json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          pageSize: result.page_size,
          total: result.total,
          totalPages: Math.ceil(result.total / result.page_size)
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
   * GET /pagos/:id - Obtener pago específico
   */
  getPago = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pago = await this.getPagoUC.execute(Number(id));

      if (!pago) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        data: pago
      });
    } catch (error: any) {
      const status = error.message.includes('inválido') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * GET /reservas/:reservaId/pagos - Obtener pagos por reserva
   */
  getPagosByReserva = async (req: Request, res: Response) => {
    try {
      const { reservaId } = req.params;
      const pagos = await this.getPagosByReservaUC.execute(Number(reservaId));

      res.json({
        success: true,
        data: pagos,
        total: pagos.length
      });
    } catch (error: any) {
      const status = error.message.includes('inválido') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * POST /pagos - Crear pago
   */
  createPago = async (req: Request, res: Response) => {
    try {
      const pagoData = req.body;
      const pago = await this.createPagoUC.execute(pagoData);

      res.status(201).json({
        success: true,
        data: pago,
        message: 'Pago creado exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  /**
   * PATCH /pagos/:id - Actualizar pago
   */
  updatePago = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const pago = await this.updatePagoUC.execute(Number(id), updateData);

      res.json({
        success: true,
        data: pago,
        message: 'Pago actualizado exitosamente'
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
   * POST /pagos/:id/procesar - Procesar pago
   */
  procesarPago = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pago = await this.procesarPagoUC.execute(Number(id));

      res.json({
        success: true,
        data: pago,
        message: 'Pago procesado exitosamente'
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
   * POST /pagos/:id/confirmar - Confirmar pago
   */
  confirmarPago = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pago = await this.confirmarPagoUC.execute(Number(id));

      res.json({
        success: true,
        data: pago,
        message: 'Pago confirmado exitosamente'
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
   * POST /pagos/:id/reembolsar - Reembolsar pago
   */
  reembolsarPago = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const pago = await this.reembolsarPagoUC.execute(Number(id), motivo);

      res.json({
        success: true,
        data: pago,
        message: 'Pago reembolsado exitosamente'
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