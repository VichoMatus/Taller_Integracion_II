import { PagoRepository } from '../../domain/pagos/repository';
import { Pago, PagosList, PagoQueryParams, PagoDetalle } from '../../domain/pagos/entities';

export class PagoService {
  constructor(private pagoRepository: PagoRepository) {}

  async getPagos(params: PagoQueryParams): Promise<PagosList> {
    return this.pagoRepository.findAll(params);
  }

  async getPagoById(id: number): Promise<PagoDetalle | null> {
    return this.pagoRepository.findById(id);
  }

  async getPagosByReserva(reservaId: number): Promise<Pago[]> {
    return this.pagoRepository.findByReservaId(reservaId);
  }
}