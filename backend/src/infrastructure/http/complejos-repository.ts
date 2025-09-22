import axios, { AxiosResponse } from 'axios';
import { ComplejoRepository } from '../../domain/complejos/repository';
import { Complejo, ComplejosList, ComplejoQueryParams } from '../../domain/complejos/entities';

export class HttpComplejoRepository implements ComplejoRepository {
  private apiClient;

  constructor(baseURL: string = process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me') {
    this.apiClient = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  async findAll(params: ComplejoQueryParams): Promise<ComplejosList> {
    try {
      const response: AxiosResponse<ComplejosList> = await this.apiClient.get('/complejos', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching complejos: ${error}`);
    }
  }

  async findById(id: number): Promise<Complejo | null> {
    try {
      const response: AxiosResponse<Complejo> = await this.apiClient.get(`/complejos/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Error fetching complejo ${id}: ${error}`);
    }
  }
}