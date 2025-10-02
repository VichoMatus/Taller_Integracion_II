import { ReservaRepository, ReservaFilters, CreateReservaInput, UpdateReservaInput, DisponibilidadInput } from "../domain/ReservaRepository";
import { Reserva, EstadoReserva, MetodoPago } from "../../domain/reserva/Reserva";
import { Paginated } from "../../app/common/pagination";

/**
 * Caso de uso para listar reservas con paginación y filtros.
 */
export class ListReservas {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Obtiene una lista paginada de reservas.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con resultado paginado
   */
  execute(filters: ReservaFilters): Promise<Paginated<Reserva>> {
    return this.repo.listReservas(filters);
  }
}

/**
 * Caso de uso para obtener una reserva específica.
 */
export class GetReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Obtiene una reserva por su ID.
   * @param id - ID de la reserva
   * @returns Promise con los datos de la reserva
   */
  execute(id: number): Promise<Reserva> {
    return this.repo.getReserva(id);
  }
}

/**
 * Caso de uso para crear una nueva reserva.
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
    
    // Verificar disponibilidad
    const disponible = await this.repo.verificarDisponibilidad({
      canchaId: input.canchaId,
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
    });
    
    if (!disponible) {
      throw new Error("La cancha no está disponible en el horario solicitado");
    }
    
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
  }
}

/**
 * Caso de uso para actualizar datos de una reserva.
 */
export class UpdateReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Actualiza parcialmente una reserva.
   * @param id - ID de la reserva
   * @param input - Datos a actualizar
   * @returns Promise con la reserva actualizada
   */
  async execute(id: number, input: UpdateReservaInput): Promise<Reserva> {
    // Si se actualizan fechas, verificar disponibilidad
    if (input.fechaInicio || input.fechaFin) {
      const reservaActual = await this.repo.getReserva(id);
      
      const fechaInicio = input.fechaInicio || reservaActual.fechaInicio;
      const fechaFin = input.fechaFin || reservaActual.fechaFin;
      
      const disponible = await this.repo.verificarDisponibilidad({
        canchaId: reservaActual.canchaId,
        fechaInicio,
        fechaFin,
        reservaId: id, // Excluir la reserva actual
      });
      
      if (!disponible) {
        throw new Error("La cancha no está disponible en el nuevo horario");
      }
    }
    
    return this.repo.updateReserva(id, input);
  }
}

/**
 * Caso de uso para eliminar una reserva.
 */
export class DeleteReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Elimina una reserva del sistema.
   * @param id - ID de la reserva a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  execute(id: number): Promise<void> {
    return this.repo.deleteReserva(id);
  }
}

/**
 * Caso de uso para verificar disponibilidad de canchas.
 */
export class VerificarDisponibilidad {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Verifica si una cancha está disponible.
   * @param input - Parámetros de disponibilidad
   * @returns Promise con disponibilidad
   */
  execute(input: DisponibilidadInput): Promise<boolean> {
    return this.repo.verificarDisponibilidad(input);
  }
}

/**
 * Caso de uso para obtener reservas de un usuario.
 */
export class GetReservasByUsuario {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Obtiene reservas de un usuario específico.
   * @param usuarioId - ID del usuario
   * @param incluirPasadas - Si incluir reservas pasadas
   * @returns Promise con lista de reservas
   */
  execute(usuarioId: number, incluirPasadas = false): Promise<Reserva[]> {
    return this.repo.getReservasByUsuario(usuarioId, incluirPasadas);
  }
}

/**
 * Caso de uso para confirmar pago de una reserva.
 */
export class ConfirmarPago {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Confirma el pago de una reserva.
   * @param id - ID de la reserva
   * @param metodoPago - Método de pago utilizado
   * @returns Promise con la reserva actualizada
   */
  execute(id: number, metodoPago: MetodoPago): Promise<Reserva> {
    return this.repo.confirmarPago(id, metodoPago);
  }
}

/**
 * Caso de uso para cancelar una reserva.
 */
export class CancelarReserva {
  constructor(private repo: ReservaRepository) {}
  
  /**
   * Cancela una reserva.
   * @param id - ID de la reserva
   * @param motivo - Motivo de cancelación
   * @returns Promise con la reserva cancelada
   */
  execute(id: number, motivo?: string): Promise<Reserva> {
    return this.repo.cancelarReserva(id, motivo);
  }
}
