import { apiBackend } from '../config/backend';
import {
  Resena,
  ResenaCreateRequest,
  ResenaUpdateRequest,
  ResenaListQuery,
  ResenaExtendida,
  EstadisticasComplejo,
  LikeResponse,
  ReportarResenaInput,
  ReporteResponse,
  ResponderResenaInput
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
      const { data } = await apiBackend.patch(`/api/resenas/${id}`, input);
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

  async obtenerResenasPorComplejo(complejoId: number): Promise<Resena[]> {
    try {
      const { data } = await apiBackend.get(`/api/resenas/complejo/${complejoId}`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async obtenerResenasPorUsuario(usuarioId: number): Promise<Resena[]> {
    try {
      const { data } = await apiBackend.get(`/api/resenas/usuario/${usuarioId}`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async obtenerEstadisticasComplejo(complejoId: number): Promise<EstadisticasComplejo> {
    try {
      const { data } = await apiBackend.get(`/api/resenas/estadisticas/${complejoId}`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async darLike(id: number): Promise<LikeResponse> {
    try {
      const { data } = await apiBackend.post(`/api/resenas/${id}/like`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async quitarLike(id: number): Promise<LikeResponse> {
    try {
      const { data } = await apiBackend.delete(`/api/resenas/${id}/like`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async reportarResena(id: number, input: ReportarResenaInput): Promise<ReporteResponse> {
    try {
      const { data } = await apiBackend.post(`/api/resenas/${id}/reportar`, input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async responderResena(id: number, input: ResponderResenaInput): Promise<void> {
    try {
      await apiBackend.post(`/api/resenas/${id}/responder`, input);
    } catch (err) {
      handleApiError(err);
    }
  }
};
