import { Cancha, CanchasList, CanchaQueryParams } from './entities';

export interface CanchaRepository {
  findAll(params: CanchaQueryParams): Promise<CanchasList>;
  findById(id: number): Promise<Cancha | null>;
}