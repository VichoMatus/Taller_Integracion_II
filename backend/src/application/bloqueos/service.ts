import { BloqueoRepository } from '../../domain/bloqueos/repository';
import { Bloqueo, BloqueosList, BloqueoQueryParams } from '../../domain/bloqueos/entities';

export class BloqueoService {
  constructor(private bloqueoRepository: BloqueoRepository) {}

  async getBloqueos(params: BloqueoQueryParams): Promise<BloqueosList> {
    return this.bloqueoRepository.findAll(params);
  }

  async getBloqueoById(id: number): Promise<Bloqueo | null> {
    return this.bloqueoRepository.findById(id);
  }
}