import axios, { AxiosResponse } from 'axios';
import { PagoRepository } from '../../domain/pagos/repository';
import { Pago, PagosList, PagoQueryParams, PagoDetalle } from '../../domain/pagos/entities';

export class HttpPagoRepository implements PagoRepository {
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

  async findAll(params: PagoQueryParams): Promise<PagosList> {
    try {
      const response: AxiosResponse<PagosList> = await this.apiClient.get('/pagos', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching pagos: ${error}`);
    }
  }

  async findById(id: number): Promise<PagoDetalle | null> {
    try {
      const response: AxiosResponse<PagoDetalle> = await this.apiClient.get(`/pagos/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Error fetching pago ${id}: ${error}`);
    }
  }

  async findByReservaId(reservaId: number): Promise<Pago[]> {
    try {
      const response: AxiosResponse<Pago[]> = await this.apiClient.get(`/reservas/${reservaId}/pagos`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching pagos for reserva ${reservaId}: ${error}`);
    }
  }
}