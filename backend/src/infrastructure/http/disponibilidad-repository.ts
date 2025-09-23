import axios, { AxiosResponse } from 'axios';
import { DisponibilidadRepository } from '../../domain/disponibilidad/repository';
import { Horario, DisponibilidadSlot, DisponibilidadConsulta } from '../../domain/disponibilidad/entities';

export class HttpDisponibilidadRepository implements DisponibilidadRepository {
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

  async getHorarios(idComplejo: number): Promise<Horario[]> {
    try {
      const response: AxiosResponse<Horario[]> = await this.apiClient.get(`/complejos/${idComplejo}/horarios`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching horarios for complejo ${idComplejo}: ${error}`);
    }
  }

  async getDisponibilidad(consulta: DisponibilidadConsulta): Promise<DisponibilidadSlot[]> {
    try {
      const response: AxiosResponse<DisponibilidadSlot[]> = await this.apiClient.get('/disponibilidad', {
        params: consulta
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching disponibilidad: ${error}`);
    }
  }
}