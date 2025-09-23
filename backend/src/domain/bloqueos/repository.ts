import { Bloqueo, BloqueosList, BloqueoQueryParams } from './entities';

export interface BloqueoRepository {
  findAll(params: BloqueoQueryParams): Promise<BloqueosList>;
  findById(id: number): Promise<Bloqueo | null>;
}