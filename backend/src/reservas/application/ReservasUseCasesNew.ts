import { ReservaRepository, ReservaFilters, CreateReservaInput, UpdateReservaInput, CotizacionInput } from "../domain/ReservaRepository";
import { Reserva, EstadoReserva, MetodoPago, CotizacionReserva } from "../../domain/reserva/Reserva";
import { Paginated } from "../../app/common/pagination";

/**
 * Caso de uso: Lista reservas (vista administrativa/owner con filtros)
 * GET /reservas
 */
export class ListReservas {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Obtiene una lista paginada de reservas con filtros avanzados.
   * @param filters - Parámetros de filtrado y paginación (rango, estado, etc.)
   * @returns Promise con resultado paginado
   */
  execute(filters: ReservaFilters): Promise<Paginated<Reserva>> {
    return this.repo.listReservas(filters);
  }
}

/**
 * Caso de uso: Obtiene reservas del usuario logueado  
 * GET /reservas/mias
 */
export class GetMisReservas {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Obtiene reservas del usuario autenticado.
   * @param usuarioId - ID del usuario logueado
   * @param incluirPasadas - Si incluir reservas pasadas
   * @returns Promise con lista de reservas
   */
  execute(usuarioId: number, incluirPasadas = false): Promise<Reserva[]> {
    return this.repo.getReservasByUsuario(usuarioId, incluirPasadas);
  }
}

/**
 * Caso de uso: Calcula precio/fees y puede "hold" temporal
 * POST /reservas/cotizar
 */
export class CotizarReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Calcula precio de reserva y puede crear un "hold" temporal.
   * @param input - Datos para cotización
   * @returns Promise con cotización detallada
   */
  async execute(input: CotizacionInput): Promise<CotizacionReserva> {
    // Validaciones básicas
    this.validateCotizacionInput(input);

    // Obtener cotización del repositorio
    return this.repo.cotizarReserva(input);
  }

  private validateCotizacionInput(input: CotizacionInput): void {
    const now = new Date();
    const fechaInicio = new Date(input.fechaInicio);
    const fechaFin = new Date(input.fechaFin);

    // Validar que las fechas sean futuras
    if (fechaInicio <= now) {
      throw new Error("La fecha de inicio debe ser futura");
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (fechaFin <= fechaInicio) {
      throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
    }

    // Validar duración mínima (1 hora) y máxima (8 horas)
    const duracionHoras = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
    if (duracionHoras < 1) {
      throw new Error("La duración mínima de una reserva es 1 hora");
    }
    if (duracionHoras > 8) {
      throw new Error("La duración máxima de una reserva es 8 horas");
    }

    if (!input.canchaId || input.canchaId <= 0) {
      throw new Error("canchaId es requerido");
    }
  }
}

/**
 * Caso de uso: Crea la reserva (tentativa o pagada)
 * POST /reservas
 */
export class CreateReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Crea una nueva reserva.
   * @param input - Datos de la reserva a crear
   * @returns Promise con la reserva creada
   */
  async execute(input: CreateReservaInput): Promise<Reserva> {
    // Validaciones de negocio
    this.validateReservaInput(input);
    
    return this.repo.createReserva(input);
  }

  private validateReservaInput(input: CreateReservaInput): void {
    const now = new Date();
    const fechaInicio = new Date(input.fechaInicio);
    const fechaFin = new Date(input.fechaFin);

    // Validar que las fechas sean futuras
    if (fechaInicio <= now) {
      throw new Error("La fecha de inicio debe ser futura");
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (fechaFin <= fechaInicio) {
      throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
    }

    // Validar duración mínima (1 hora) y máxima (8 horas)
    const duracionHoras = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
    if (duracionHoras < 1) {
      throw new Error("La duración mínima de una reserva es 1 hora");
    }
    if (duracionHoras > 8) {
      throw new Error("La duración máxima de una reserva es 8 horas");
    }

    // Validar que la reserva no sea con más de 30 días de anticipación
    const diasAnticipacion = (fechaInicio.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diasAnticipacion > 30) {
      throw new Error("No se pueden hacer reservas con más de 30 días de anticipación");
    }

    if (!input.canchaId || input.canchaId <= 0) {
      throw new Error("canchaId es requerido");
    }

    if (!input.usuarioId || input.usuarioId <= 0) {
      throw new Error("usuarioId es requerido");
    }
  }
}

/**
 * Caso de uso: Obtiene detalle de la reserva
 * GET /reservas/{id_reserva}
 */
export class GetReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Obtiene una reserva por su ID.
   * @param id - ID de la reserva
   * @returns Promise con los datos de la reserva
   */
  execute(id: number): Promise<Reserva> {
    if (!id || id <= 0) {
      throw new Error("ID de reserva inválido");
    }
    
    return this.repo.getReserva(id);
  }
}

/**
 * Caso de uso: Reprograma/edita (si política lo permite)
 * PATCH /reservas/{id_reserva}
 */
export class UpdateReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Actualiza una reserva si las políticas lo permiten.
   * @param id - ID de la reserva
   * @param input - Datos a actualizar
   * @returns Promise con la reserva actualizada
   */
  async execute(id: number, input: UpdateReservaInput): Promise<Reserva> {
    if (!id || id <= 0) {
      throw new Error("ID de reserva inválido");
    }

    // Obtener reserva actual para validaciones
    const reservaActual = await this.repo.getReserva(id);
    
    // Validar que se puede modificar
    this.validateCanUpdate(reservaActual);
    
    return this.repo.updateReserva(id, input);
  }

  private validateCanUpdate(reserva: Reserva): void {
    // No se puede modificar reservas confirmadas próximas (menos de 24h)
    if (reserva.estado === EstadoReserva.CONFIRMADA) {
      const fechaInicio = new Date(reserva.fechaInicio);
      const ahora = new Date();
      const horasHastaInicio = (fechaInicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);
      
      if (horasHastaInicio < 24) {
        throw new Error("No se puede modificar una reserva confirmada con menos de 24 horas de anticipación");
      }
    }

    // No se pueden modificar reservas canceladas o completadas
    if ([EstadoReserva.CANCELADA, EstadoReserva.COMPLETADA, EstadoReserva.NO_SHOW].includes(reserva.estado)) {
      throw new Error("No se puede modificar una reserva en estado " + reserva.estado);
    }
  }
}

/**
 * Caso de uso: Cancela reserva (aplica política/cargo)
 * POST /reservas/{id_reserva}/cancelar
 */
export class CancelarReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Cancela una reserva aplicando políticas de cancelación.
   * @param id - ID de la reserva
   * @param motivo - Motivo de cancelación
   * @returns Promise con la reserva cancelada
   */
  async execute(id: number, motivo?: string): Promise<Reserva> {
    if (!id || id <= 0) {
      throw new Error("ID de reserva inválido");
    }

    return this.repo.cancelarReserva(id, motivo);
  }
}

/**
 * Caso de uso: Confirma reserva (post-pago)
 * POST /reservas/{id_reserva}/confirmar
 */
export class ConfirmarReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Confirma una reserva después del pago.
   * @param id - ID de la reserva
   * @param metodoPago - Método de pago utilizado
   * @returns Promise con la reserva confirmada
   */
  execute(id: number, metodoPago: MetodoPago): Promise<Reserva> {
    if (!id || id <= 0) {
      throw new Error("ID de reserva inválido");
    }

    return this.repo.confirmarPago(id, metodoPago);
  }
}

/**
 * Caso de uso: Marca asistencia
 * POST /reservas/{id_reserva}/check-in
 */
export class CheckInReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Marca la asistencia del usuario a la reserva.
   * @param id - ID de la reserva
   * @returns Promise con la reserva actualizada
   */
  execute(id: number): Promise<Reserva> {
    if (!id || id <= 0) {
      throw new Error("ID de reserva inválido");
    }

    return this.repo.checkInReserva(id);
  }
}

/**
 * Caso de uso: Marca inasistencia
 * POST /reservas/{id_reserva}/no-show
 */
export class NoShowReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Marca la inasistencia del usuario a la reserva.
   * @param id - ID de la reserva
   * @param observaciones - Observaciones adicionales
   * @returns Promise con la reserva actualizada
   */
  execute(id: number, observaciones?: string): Promise<Reserva> {
    if (!id || id <= 0) {
      throw new Error("ID de reserva inválido");
    }

    return this.repo.noShowReserva(id, observaciones);
  }
}