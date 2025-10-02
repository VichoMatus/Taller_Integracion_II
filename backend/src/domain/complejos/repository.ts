import { Complejo, ComplejosList, ComplejoQueryParams } from './entities';

export interface ComplejoRepository {
  findAll(params: ComplejoQueryParams): Promise<ComplejosList>;
  findById(id: number): Promise<Complejo | null>;
}