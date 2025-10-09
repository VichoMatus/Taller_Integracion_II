import { PagoRepository } from '../../domain/pagos/repository';
import { Pago, PagosList, PagoQueryParams, PagoDetalle } from '../../domain/pagos/entities';

/**
 * Caso de uso: Listar pagos
 */
export class ListPagos {
  constructor(private repository: PagoRepository) {}

  async execute(params: PagoQueryParams): Promise<PagosList> {
    return await this.repository.findAll(params);
  }
}

/**
 * Caso de uso: Obtener pago específico
 */
export class GetPago {
  constructor(private repository: PagoRepository) {}

  async execute(id: number): Promise<PagoDetalle | null> {
    if (!id || id <= 0) {
      throw new Error('ID de pago inválido');
    }

    return await this.repository.findById(id);
  }
}

/**
 * Caso de uso: Obtener pagos por reserva
 */
export class GetPagosByReserva {
  constructor(private repository: PagoRepository) {}

  async execute(reservaId: number): Promise<Pago[]> {
    if (!reservaId || reservaId <= 0) {
      throw new Error('ID de reserva inválido');
    }

    return await this.repository.findByReservaId(reservaId);
  }
}

/**
 * Caso de uso: Crear pago
 */
export class CreatePago {
  constructor(private repository: PagoRepository) {}

  async execute(data: Omit<Pago, 'id_pago' | 'created_at' | 'updated_at'>): Promise<Pago> {
    // Validaciones
    this.validatePagoData(data);

    return await this.repository.createPago(data);
  }

  private validatePagoData(data: any): void {
    if (!data.id_reserva || data.id_reserva <= 0) {
      throw new Error('id_reserva es requerido');
    }

    if (!data.proveedor || data.proveedor.trim().length === 0) {
      throw new Error('proveedor es requerido');
    }

    if (!data.moneda || data.moneda.trim().length === 0) {
      throw new Error('moneda es requerida');
    }

    if (!data.monto || data.monto <= 0) {
      throw new Error('monto debe ser mayor a 0');
    }

    const estadosValidos = ['creado', 'autorizado', 'pagado', 'fallido', 'reembolsado'];
    if (!data.estado || !estadosValidos.includes(data.estado)) {
      throw new Error('estado debe ser uno de: ' + estadosValidos.join(', '));
    }

    if (!data.metadata) {
      data.metadata = {};
    }
  }
}

/**
 * Caso de uso: Actualizar pago
 */
export class UpdatePago {
  constructor(private repository: PagoRepository) {}

  async execute(id: number, data: Partial<Pago>): Promise<Pago> {
    if (!id || id <= 0) {
      throw new Error('ID de pago inválido');
    }

    // Verificar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Pago no encontrado');
    }

    return await this.repository.updatePago(id, data);
  }
}

/**
 * Caso de uso: Procesar pago
 */
export class ProcesarPago {
  constructor(private repository: PagoRepository) {}

  async execute(id: number): Promise<Pago> {
    if (!id || id <= 0) {
      throw new Error('ID de pago inválido');
    }

    // Verificar que existe y está en estado válido
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Pago no encontrado');
    }

    if (existing.estado !== 'creado' && existing.estado !== 'autorizado') {
      throw new Error(`No se puede procesar un pago en estado "${existing.estado}"`);
    }

    return await this.repository.procesarPago(id);
  }
}

/**
 * Caso de uso: Confirmar pago
 */
export class ConfirmarPago {
  constructor(private repository: PagoRepository) {}

  async execute(id: number): Promise<Pago> {
    if (!id || id <= 0) {
      throw new Error('ID de pago inválido');
    }

    // Verificar que existe y está en estado válido
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Pago no encontrado');
    }

    if (existing.estado !== 'autorizado') {
      throw new Error(`No se puede confirmar un pago en estado "${existing.estado}"`);
    }

    return await this.repository.confirmarPago(id);
  }
}

/**
 * Caso de uso: Reembolsar pago
 */
export class ReembolsarPago {
  constructor(private repository: PagoRepository) {}

  async execute(id: number, motivo?: string): Promise<Pago> {
    if (!id || id <= 0) {
      throw new Error('ID de pago inválido');
    }

    // Verificar que existe y está en estado válido para reembolso
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Pago no encontrado');
    }

    if (existing.estado !== 'pagado') {
      throw new Error(`No se puede reembolsar un pago en estado "${existing.estado}"`);
    }

    return await this.repository.reembolsarPago(id, motivo);
  }
}