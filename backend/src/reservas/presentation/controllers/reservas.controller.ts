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
      // Soporte para ambos formatos: timestamp completo y fecha + hora
      let fechaInicio: Date, fechaFin: Date;
      
      if (req.body.fechaInicio && req.body.fechaFin) {
        // Formato timestamp completo (legacy)
        fechaInicio = new Date(req.body.fechaInicio);
        fechaFin = new Date(req.body.fechaFin);
      } else if (req.body.fecha && req.body.inicio && req.body.fin) {
        // Formato fecha + hora separada (nuevo, como Taller4)
        fechaInicio = new Date(`${req.body.fecha}T${req.body.inicio}:00.000Z`);
        fechaFin = new Date(`${req.body.fecha}T${req.body.fin}:00.000Z`);
      } else {
        return res.status(400).json(fail(400, "Debe proporcionar fechaInicio/fechaFin o fecha/inicio/fin"));
      }
      
      const input = {
        usuarioId: req.body.id_usuario || (req as any).user?.id_usuario,
        canchaId: req.body.id_cancha || req.body.canchaId,
        fechaInicio,
        fechaFin,
        metodoPago: req.body.metodoPago,
        notas: req.body.notas,
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
      console.log('🔍 [update] Request body:', JSON.stringify(req.body, null, 2));
      console.log('🔍 [update] Params:', req.params);
      
      const input = { ...req.body };
      
      // Soporte para ambos formatos de fecha
      if (req.body.fechaInicio) {
        input.fechaInicio = new Date(req.body.fechaInicio);
        console.log('🔄 [update] Usando fechaInicio del body');
      } else if (req.body.fecha && req.body.inicio) {
        input.fechaInicio = new Date(`${req.body.fecha}T${req.body.inicio}:00.000Z`);
        console.log('🔄 [update] Construido fechaInicio desde fecha+inicio');
      }
      
      if (req.body.fechaFin) {
        input.fechaFin = new Date(req.body.fechaFin);
        console.log('🔄 [update] Usando fechaFin del body');
      } else if (req.body.fecha && req.body.fin) {
        input.fechaFin = new Date(`${req.body.fecha}T${req.body.fin}:00.000Z`);
        console.log('🔄 [update] Construido fechaFin desde fecha+fin');
      }
      
      console.log('📤 [update] Input procesado:', input);
      
      const reserva = await this.updateReservaUC.execute(Number(req.params.id), input);
      console.log('✅ [update] Reserva actualizada exitosamente');
      res.json(ok(reserva));
    } catch (e: any) {
      console.error('❌ [update] Error:', e);
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
   * GET /reservas/usuario/:usuarioId o GET /reservas/mias
   */
  getByUsuario = async (req: Request, res: Response) => {
    try {
      // Para el endpoint /mias, usar el ID del usuario autenticado
      const usuarioId = req.params.usuarioId ? 
        Number(req.params.usuarioId) : 
        (req as any).user?.id_usuario;
      
      if (!usuarioId) {
        return res.status(400).json(fail(400, "Usuario no identificado"));
      }
      
      const incluirPasadas = req.query.incluirPasadas === 'true';
      
      const reservas = await this.getReservasByUsuarioUC.execute(usuarioId, incluirPasadas);
      res.json(ok(reservas));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Cotiza el precio de una reserva.
   * POST /reservas/cotizar
   */
  cotizar = async (req: Request, res: Response) => {
    try {
      const { id_cancha, fecha, inicio, fin, cupon } = req.body;
      
      if (!id_cancha || !fecha || !inicio || !fin) {
        return res.status(400).json(fail(400, "id_cancha, fecha, inicio y fin son requeridos"));
      }
      
      // Construir fechas ISO string para la cotización
      const fechaInicio = `${fecha}T${inicio}:00`;
      const fechaFin = `${fecha}T${fin}:00`;
      
      // Simular respuesta de cotización hasta que se implemente el caso de uso
      const cotizacion = {
        moneda: "CLP",
        subtotal: 12000.0,
        descuento: cupon ? 2000.0 : 0.0,
        total: cupon ? 10000.0 : 12000.0,
        detalle: cupon ? `Descuento aplicado con cupón: ${cupon}` : "Precio base por hora"
      };
      
      res.json(ok(cotizacion));
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
   * ✅ ACTUALIZADO: Maneja múltiples formatos de entrada del frontend
   */
  createAdmin = async (req: Request, res: Response) => {
    try {
      if (!this.createReservaAdminUC) {
        return res.status(501).json(fail(501, "Funcionalidad administrativa no disponible"));
      }

      console.log('📝 [ReservasController.createAdmin] Request body:', req.body);
      
      // Extraer datos con soporte para múltiples formatos
      const { 
        id_cancha, cancha_id, canchaId,
        fecha_reserva, fecha, fecha_inicio, fecha_fin,
        hora_inicio, hora_fin, inicio, fin,
        id_usuario, usuario_id, usuarioId,
        notas
      } = req.body;
      
      const adminUserId = (req as any).user?.id_usuario;
      
      // Determinar IDs (prioritario: campos snake_case)
      const canchaIdFinal = id_cancha || cancha_id || canchaId;
      const targetUserId = id_usuario || usuario_id || usuarioId || adminUserId;
      
      // Construir fechas - soportar diferentes formatos
      let fechaInicio: Date;
      let fechaFin: Date;
      
      if (fecha_inicio && fecha_fin) {
        // Formato 1: fechas ISO completas
        fechaInicio = new Date(fecha_inicio);
        fechaFin = new Date(fecha_fin);
      } else if (fecha_reserva && hora_inicio && hora_fin) {
        // Formato 2: fecha separada + horas
        fechaInicio = new Date(`${fecha_reserva}T${hora_inicio}:00.000Z`);
        fechaFin = new Date(`${fecha_reserva}T${hora_fin}:00.000Z`);
      } else if (fecha && (inicio || hora_inicio) && (fin || hora_fin)) {
        // Formato 3: fecha + inicio/fin
        const horaInicio = inicio || hora_inicio;
        const horaFin = fin || hora_fin;
        fechaInicio = new Date(`${fecha}T${horaInicio}:00.000Z`);
        fechaFin = new Date(`${fecha}T${horaFin}:00.000Z`);
      } else {
        return res.status(400).json(fail(400, "Formato de fecha/hora inválido", {
          formatos_soportados: [
            "{ fecha_inicio: ISO, fecha_fin: ISO }",
            "{ fecha_reserva: 'YYYY-MM-DD', hora_inicio: 'HH:MM', hora_fin: 'HH:MM' }",
            "{ fecha: 'YYYY-MM-DD', inicio: 'HH:MM', fin: 'HH:MM' }"
          ],
          recibido: req.body
        }));
      }

      const input = {
        usuarioId: targetUserId,
        canchaId: canchaIdFinal,
        fechaInicio,
        fechaFin,
        metodoPago: undefined,
        notas: notas || `Creada por administrador ${adminUserId}`
      };

      console.log('🚀 [ReservasController.createAdmin] Input procesado:', input);

      const reserva = await this.createReservaAdminUC.execute(input, targetUserId, adminUserId);
      res.status(201).json(ok(reserva));
    } catch (e: any) {
      console.error('❌ [ReservasController.createAdmin] Error:', e);
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
