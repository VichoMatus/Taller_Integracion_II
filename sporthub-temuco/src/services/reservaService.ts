import { apiBackend } from '../config/backend';
import {
  Reserva,
  ReservaFilters,
  CreateReservaInput,
  UpdateReservaInput
} from '../types/reserva';
import { handleApiError } from "../services/ApiError";

export const reservaService = {
  async getReservas(filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      const { data } = await apiBackend.get('/api/reservas', { params: filters });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async getReservaById(id: number): Promise<Reserva> {
    try {
      const { data } = await apiBackend.get(`/api/reservas/${id}`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async createReserva(input: CreateReservaInput): Promise<Reserva> {
    try {
      const { data } = await apiBackend.post('/api/reservas', input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async updateReserva(id: number, input: UpdateReservaInput): Promise<Reserva> {
    try {
      const { data } = await apiBackend.patch(`/api/reservas/${id}`, input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async deleteReserva(id: number): Promise<void> {
    try {
      await apiBackend.delete(`/api/reservas/${id}`);
    } catch (err) {
      handleApiError(err);
    }
  },

  async getReservasByUsuario(usuarioId: number): Promise<Reserva[]> {
    try {
      const { data } = await apiBackend.get(`/api/reservas/usuario/${usuarioId}`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async verificarDisponibilidad(canchaId: number, fechaInicio: string, fechaFin: string, reservaId?: number): Promise<{ disponible: boolean; mensaje?: string }> {
    try {
      const body = { canchaId, fechaInicio, fechaFin, reservaId };
      const { data } = await apiBackend.post('/api/reservas/verificar-disponibilidad', body);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async confirmarPago(id: number): Promise<Reserva> {
    try {
      const { data } = await apiBackend.post(`/api/reservas/${id}/confirmar-pago`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async cancelarReserva(id: number): Promise<Reserva> {
    try {
      const { data } = await apiBackend.post(`/api/reservas/${id}/cancelar`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  }
};
