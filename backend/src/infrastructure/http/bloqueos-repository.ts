import axios, { AxiosResponse } from 'axios';
import { buildHttpClient } from '../../infra/http/client';
import { BloqueoRepository } from '../../domain/bloqueos/repository';
import { Bloqueo, BloqueosList, BloqueoQueryParams } from '../../domain/bloqueos/entities';

export class HttpBloqueoRepository implements BloqueoRepository {
  private apiClient;

  constructor(baseURL: string = process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me') {
    this.apiClient = buildHttpClient(baseURL, () => undefined);
  }

  async findAll(params: BloqueoQueryParams): Promise<BloqueosList> {
    try {
      const response: AxiosResponse<BloqueosList> = await this.apiClient.get('/bloqueos', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching bloqueos: ${error}`);
    }
  }

  async findById(id: number): Promise<Bloqueo | null> {
    try {
      const response: AxiosResponse<Bloqueo> = await this.apiClient.get(`/bloqueos/${id}`);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Error fetching bloqueo ${id}: ${error}`);
    }
  }
}