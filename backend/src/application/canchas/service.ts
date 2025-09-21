import { CanchaRepository } from '../../domain/canchas/repository';
import { Cancha, CanchasList, CanchaQueryParams } from '../../domain/canchas/entities';

export class CanchaService {
  constructor(private canchaRepository: CanchaRepository) {}

  async getCanchas(params: CanchaQueryParams): Promise<CanchasList> {
    return this.canchaRepository.findAll(params);
  }

  async getCanchaById(id: number): Promise<Cancha | null> {
    return this.canchaRepository.findById(id);
  }
}