import { Pago, PagosList, PagoQueryParams, PagoDetalle } from './entities';

export interface PagoRepository {
  findAll(params: PagoQueryParams): Promise<PagosList>;
  findById(id: number): Promise<PagoDetalle | null>;
  findByReservaId(reservaId: number): Promise<Pago[]>;
}