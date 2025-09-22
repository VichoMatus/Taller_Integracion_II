import axios, { AxiosResponse } from 'axios';
import { BloqueoRepository } from '../../domain/bloqueos/repository';
import { Bloqueo, BloqueosList, BloqueoQueryParams } from '../../domain/bloqueos/entities';

export class HttpBloqueoRepository implements BloqueoRepository {
  private apiClient;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.apiClient = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
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