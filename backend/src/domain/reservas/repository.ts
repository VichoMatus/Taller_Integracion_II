import { Reserva, ReservasList, ReservaQueryParams, ReservaDetalle } from './entities';

export interface ReservaRepository {
  findAll(params: ReservaQueryParams): Promise<ReservasList>;
  findById(id: number): Promise<ReservaDetalle | null>;
  findByUserId(userId: number, params?: Omit<ReservaQueryParams, 'id_usuario'>): Promise<ReservasList>;
}