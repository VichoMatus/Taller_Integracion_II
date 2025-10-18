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
  CancelarReserva,
  CreateReservaAdmin,
  CancelarReservaAdmin,
  GetReservasByCancha,
  GetReservasByUsuarioAdmin
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
    private cancelarReservaUC: CancelarReserva,
    // Casos de uso administrativos
    private createReservaAdminUC?: CreateReservaAdmin,
    private cancelarReservaAdminUC?: CancelarReservaAdmin,
    private getReservasByCanchaUC?: GetReservasByCancha,
    private getReservasByUsuarioAdminUC?: GetReservasByUsuarioAdmin
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

  // ===== MÉTODOS ADMINISTRATIVOS =====

  /**
   * Crea una reserva como administrador.
   * POST /reservas/admin/crear
   */
  createAdmin = async (req: Request, res: Response) => {
    try {
      if (!this.createReservaAdminUC) {
        return res.status(501).json(fail(501, "Funcionalidad administrativa no disponible"));
      }

      const { id_cancha, fecha_reserva, hora_inicio, hora_fin, id_usuario } = req.body;
      const adminUserId = (req as any).user?.id_usuario;
      const targetUserId = id_usuario || adminUserId;

      // Construir fechas completas
      const fechaInicio = new Date(`${fecha_reserva}T${hora_inicio}:00.000Z`);
      const fechaFin = new Date(`${fecha_reserva}T${hora_fin}:00.000Z`);

      const input = {
        usuarioId: targetUserId,
        canchaId: id_cancha,
        fechaInicio,
        fechaFin,
        metodoPago: undefined,
        notas: `Creada por administrador ${adminUserId}`
      };

      const reserva = await this.createReservaAdminUC.execute(input, targetUserId, adminUserId);
      res.status(201).json(ok(reserva));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Cancela una reserva como administrador.
   * POST /reservas/admin/:id/cancelar
   */
  cancelarAdmin = async (req: Request, res: Response) => {
    try {
      if (!this.cancelarReservaAdminUC) {
        return res.status(501).json(fail(501, "Funcionalidad administrativa no disponible"));
      }

      const { motivo } = req.body;
      const adminUserId = (req as any).user?.id_usuario;

      const reserva = await this.cancelarReservaAdminUC.execute(
        Number(req.params.id), 
        adminUserId, 
        motivo
      );
      res.json(ok(reserva));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene reservas de una cancha específica.
   * GET /reservas/admin/cancha/:canchaId
   */
  getByCancha = async (req: Request, res: Response) => {
    try {
      if (!this.getReservasByCanchaUC) {
        return res.status(501).json(fail(501, "Funcionalidad administrativa no disponible"));
      }

      const canchaId = Number(req.params.canchaId);
      const filters = {
        fechaDesde: req.query.fecha_desde ? new Date(req.query.fecha_desde as string) : undefined,
        fechaHasta: req.query.fecha_hasta ? new Date(req.query.fecha_hasta as string) : undefined,
        estado: req.query.estado as any,
      };

      const reservas = await this.getReservasByCanchaUC.execute(canchaId, filters);
      res.json(ok(reservas));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene reservas de un usuario específico (vista administrativa).
   * GET /reservas/admin/usuario/:usuarioId
   */
  getByUsuarioAdmin = async (req: Request, res: Response) => {
    try {
      if (!this.getReservasByUsuarioAdminUC) {
        return res.status(501).json(fail(501, "Funcionalidad administrativa no disponible"));
      }

      const usuarioId = Number(req.params.usuarioId);
      const filters = {
        fechaDesde: req.query.fecha_desde ? new Date(req.query.fecha_desde as string) : undefined,
        fechaHasta: req.query.fecha_hasta ? new Date(req.query.fecha_hasta as string) : undefined,
        estado: req.query.estado as any,
      };

      const reservas = await this.getReservasByUsuarioAdminUC.execute(usuarioId, filters);
      res.json(ok(reservas));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };
}
