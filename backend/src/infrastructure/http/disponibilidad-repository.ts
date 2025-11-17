import axios, { AxiosResponse } from 'axios';
import { buildHttpClient } from '../../infra/http/client';
import { DisponibilidadRepository } from '../../domain/disponibilidad/repository';
import { Horario, DisponibilidadSlot, DisponibilidadConsulta } from '../../domain/disponibilidad/entities';

export class HttpDisponibilidadRepository implements DisponibilidadRepository {
  private apiClient;

  constructor(baseURL: string = process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me') {
    this.apiClient = buildHttpClient(baseURL, () => undefined);
    // buildHttpClient ensures /api/v1 is appended and token management consistent
    // The repo can call relative endpoints like /complejos/:id/horarios safely.
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