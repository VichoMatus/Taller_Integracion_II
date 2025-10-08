import { apiBackend } from '../config/backend';
import {
  Resena,
  ResenaCreateRequest,
  ResenaUpdateRequest,
  ResenaListQuery,
  ResumenCalificacion
} from '../types/resena';
import { handleApiError } from "../services/ApiError";

export const resenaService = {
  async crearResena(input: ResenaCreateRequest): Promise<Resena> {
    try {
      const { data } = await apiBackend.post('/api/resenas', input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async listarResenas(query?: ResenaListQuery): Promise<Resena[]> {
    try {
      const { data } = await apiBackend.get('/api/resenas', { params: query });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async obtenerResena(id: number | string): Promise<Resena> {
    try {
      const { data } = await apiBackend.get(`/api/resenas/${id}`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async actualizarResena(id: number | string, input: ResenaUpdateRequest): Promise<Resena> {
    try {
      const { data } = await apiBackend.put(`/api/resenas/${id}`, input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async eliminarResena(id: number | string): Promise<void> {
    try {
      await apiBackend.delete(`/api/resenas/${id}`);
    } catch (err) {
      handleApiError(err);
    }
  },

  async obtenerResumenCalificacion(id_cancha: number | string): Promise<ResumenCalificacion> {
    try {
      const { data } = await apiBackend.get(`/api/resenas/cancha/${id_cancha}/resumen`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  }
};
