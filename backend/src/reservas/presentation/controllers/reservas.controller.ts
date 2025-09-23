import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { 
  ListReservas, 
  GetReserva, 
  CreateReserva, 
  UpdateReserva, 
  DeleteReserva,
  VerificarDisponibilidad,
  GetReservasByUsuario,
  ConfirmarPago,
  CancelarReserva
} from "../../application/ReservasUseCases";

/**
 * Controlador para operaciones de reservas.
 * Maneja las peticiones HTTP para gestión de reservas de canchas.
 */
export class ReservasController {
  constructor(
    private listReservasUC: ListReservas,
    private getReservaUC: GetReserva,
    private createReservaUC: CreateReserva,
    private updateReservaUC: UpdateReserva,
    private deleteReservaUC: DeleteReserva,
    private verificarDisponibilidadUC: VerificarDisponibilidad,
    private getReservasByUsuarioUC: GetReservasByUsuario,
    private confirmarPagoUC: ConfirmarPago,
    private cancelarReservaUC: CancelarReserva
  ) {}

  /**
   * Lista reservas con paginación y filtros.
   * GET /reservas
   */
  list = async (req: Request, res: Response) => {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        usuarioId: req.query.usuarioId ? Number(req.query.usuarioId) : undefined,
        canchaId: req.query.canchaId ? Number(req.query.canchaId) : undefined,
        complejoId: req.query.complejoId ? Number(req.query.complejoId) : undefined,
        estado: req.query.estado as any,
        fechaDesde: req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined,
        fechaHasta: req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined,
        pagado: req.query.pagado ? req.query.pagado === 'true' : undefined,
        codigoConfirmacion: req.query.codigoConfirmacion as string | undefined,
      };
      
      const result = await this.listReservasUC.execute(filters);
      res.json(ok(result));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene una reserva específica.
   * GET /reservas/:id
   */
  get = async (req: Request, res: Response) => {
    try {
      const reserva = await this.getReservaUC.execute(Number(req.params.id));
      res.json(ok(reserva));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Crea una nueva reserva.
   * POST /reservas
   */
  create = async (req: Request, res: Response) => {
    try {
      const input = {
        ...req.body,
        fechaInicio: new Date(req.body.fechaInicio),
        fechaFin: new Date(req.body.fechaFin),
      };
      
      const reserva = await this.createReservaUC.execute(input);
      res.status(201).json(ok(reserva));
    } catch (e: any) {
      res.status(e?.statusCode ?? 400).json(fail(e?.statusCode ?? 400, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Actualiza una reserva.
   * PATCH /reservas/:id
   */
  update = async (req: Request, res: Response) => {
    try {
      const input = { ...req.body };
      
      // Convertir fechas si están presentes
      if (req.body.fechaInicio) {
        input.fechaInicio = new Date(req.body.fechaInicio);
      }
      if (req.body.fechaFin) {
        input.fechaFin = new Date(req.body.fechaFin);
      }
      
      const reserva = await this.updateReservaUC.execute(Number(req.params.id), input);
      res.json(ok(reserva));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Elimina una reserva.
   * DELETE /reservas/:id
   */
  delete = async (req: Request, res: Response) => {
    try {
      await this.deleteReservaUC.execute(Number(req.params.id));
      res.json(ok({ deleted: true }));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Verifica disponibilidad de una cancha.
   * POST /reservas/verificar-disponibilidad
   */
  verificarDisponibilidad = async (req: Request, res: Response) => {
    try {
      const { canchaId, fechaInicio, fechaFin, reservaId } = req.body;
      
      if (!canchaId || !fechaInicio || !fechaFin) {
        return res.status(400).json(fail(400, "canchaId, fechaInicio y fechaFin son requeridos"));
      }
      
      const disponible = await this.verificarDisponibilidadUC.execute({
        canchaId: Number(canchaId),
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        reservaId: reservaId ? Number(reservaId) : undefined,
      });
      
      res.json(ok({ disponible }));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene reservas de un usuario específico.
   * GET /reservas/usuario/:usuarioId
   */
  getByUsuario = async (req: Request, res: Response) => {
    try {
      const usuarioId = Number(req.params.usuarioId);
      const incluirPasadas = req.query.incluirPasadas === 'true';
      
      const reservas = await this.getReservasByUsuarioUC.execute(usuarioId, incluirPasadas);
      res.json(ok(reservas));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Confirma el pago de una reserva.
   * POST /reservas/:id/confirmar-pago
   */
  confirmarPago = async (req: Request, res: Response) => {
    try {
      const { metodoPago } = req.body;
      
      if (!metodoPago) {
        return res.status(400).json(fail(400, "metodoPago es requerido"));
      }
      
      const reserva = await this.confirmarPagoUC.execute(Number(req.params.id), metodoPago);
      res.json(ok(reserva));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Cancela una reserva.
   * POST /reservas/:id/cancelar
   */
  cancelar = async (req: Request, res: Response) => {
    try {
      const { motivo } = req.body;
      
      const reserva = await this.cancelarReservaUC.execute(Number(req.params.id), motivo);
      res.json(ok(reserva));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };
}
