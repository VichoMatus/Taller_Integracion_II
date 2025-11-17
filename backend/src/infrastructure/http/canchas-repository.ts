import axios, { AxiosResponse } from 'axios';
import { buildHttpClient } from '../../infra/http/client';
import { CanchaRepository } from '../../domain/canchas/repository';
import { Cancha, CanchasList, CanchaQueryParams } from '../../domain/canchas/entities';

export class HttpCanchaRepository implements CanchaRepository {
  private apiClient;

  constructor(baseURL: string = process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me') {
    this.apiClient = buildHttpClient(baseURL, () => undefined);
  }

  async findAll(params: CanchaQueryParams): Promise<CanchasList> {
    try {
      const response: AxiosResponse<CanchasList> = await this.apiClient.get('/canchas', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching canchas: ${error}`);
    }
  }

  async findById(id: number): Promise<Cancha | null> {
    try {
      const response: AxiosResponse<Cancha> = await this.apiClient.get(`/canchas/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Error fetching cancha ${id}: ${error}`);
    }
  }
}