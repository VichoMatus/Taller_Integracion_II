import axios, { AxiosResponse } from 'axios';
import { ReservaRepository } from '../../domain/reservas/repository';
import { Reserva, ReservasList, ReservaQueryParams, ReservaDetalle } from '../../domain/reservas/entities';

export class HttpReservaRepository implements ReservaRepository {
  private apiClient;

  constructor(baseURL: string = process.env.API_BASE_URL || 'http://localhost:8000') {
    this.apiClient = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  async findAll(params: ReservaQueryParams): Promise<ReservasList> {
    try {
      const response: AxiosResponse<ReservasList> = await this.apiClient.get('/reservas', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching reservas: ${error}`);
    }
  }

  async findById(id: number): Promise<ReservaDetalle | null> {
    try {
      const response: AxiosResponse<ReservaDetalle> = await this.apiClient.get(`/reservas/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Error fetching reserva ${id}: ${error}`);
    }
  }

  async findByUserId(userId: number, params?: Omit<ReservaQueryParams, 'id_usuario'>): Promise<ReservasList> {
    try {
      const queryParams = { ...params, id_usuario: userId };
      const response: AxiosResponse<ReservasList> = await this.apiClient.get('/reservas', { params: queryParams });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching reservas for user ${userId}: ${error}`);
    }
  }
}