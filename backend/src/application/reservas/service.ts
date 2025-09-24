import { ReservaRepository } from '../../domain/reservas/repository';
import { Reserva, ReservasList, ReservaQueryParams, ReservaDetalle } from '../../domain/reservas/entities';

export class ReservaService {
  constructor(private reservaRepository: ReservaRepository) {}

  async getReservas(params: ReservaQueryParams): Promise<ReservasList> {
    return this.reservaRepository.findAll(params);
  }

  async getReservaById(id: number): Promise<ReservaDetalle | null> {
    return this.reservaRepository.findById(id);
  }

  async getReservasByUser(userId: number, params?: Omit<ReservaQueryParams, 'id_usuario'>): Promise<ReservasList> {
    return this.reservaRepository.findByUserId(userId, params);
  }
}