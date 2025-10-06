import { Pago, PagosList, PagoQueryParams, PagoDetalle } from './entities';

export interface PagoRepository {
  findAll(params: PagoQueryParams): Promise<PagosList>;
  findById(id: number): Promise<PagoDetalle | null>;
  findByReservaId(reservaId: number): Promise<Pago[]>;
  createPago(data: Omit<Pago, 'id_pago' | 'created_at' | 'updated_at'>): Promise<Pago>;
  updatePago(id: number, data: Partial<Pago>): Promise<Pago>;
  procesarPago(id: number): Promise<Pago>;
  reembolsarPago(id: number, motivo?: string): Promise<Pago>;
  confirmarPago(id: number): Promise<Pago>;
}