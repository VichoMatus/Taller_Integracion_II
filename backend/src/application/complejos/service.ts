import { ComplejoRepository } from '../../domain/complejos/repository';
import { Complejo, ComplejosList, ComplejoQueryParams } from '../../domain/complejos/entities';

export class ComplejoService {
  constructor(private complejoRepository: ComplejoRepository) {}

  async getComplejos(params: ComplejoQueryParams): Promise<ComplejosList> {
    return this.complejoRepository.findAll(params);
  }

  async getComplejoById(id: number): Promise<Complejo | null> {
    return this.complejoRepository.findById(id);
  }
}