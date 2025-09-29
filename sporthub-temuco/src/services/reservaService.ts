import { apiBackend } from '../config/backend';
import {
  Reserva,
  ReservaFilters,
  CreateReservaInput,
  UpdateReservaInput
} from '../types/reserva';

export const reservaService = {
  /**
   * Obtener todas las reservas (con filtros opcionales)
   */
  async getReservas(filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      const response = await apiBackend.get('/api/reservas', { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener reservas: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Obtener una reserva por ID
   */
  async getReservaById(id: number): Promise<Reserva> {
    try {
      const response = await apiBackend.get(`/api/reservas/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener reserva: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Crear una nueva reserva
   */
  async createReserva(input: CreateReservaInput): Promise<Reserva> {
    try {
      const response = await apiBackend.post('/api/reservas', input);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al crear reserva: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Actualizar una reserva existente
   */
  async updateReserva(id: number, input: UpdateReservaInput): Promise<Reserva> {
    try {
      const response = await apiBackend.patch(`/api/reservas/${id}`, input);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al actualizar reserva: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Eliminar una reserva
   */
  async deleteReserva(id: number): Promise<void> {
    try {
      await apiBackend.delete(`/api/reservas/${id}`);
    } catch (error: any) {
      throw new Error('Error al eliminar reserva: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Obtener reservas de un usuario
   */
  async getReservasByUsuario(usuarioId: number): Promise<Reserva[]> {
    try {
      const response = await apiBackend.get(`/api/reservas/usuario/${usuarioId}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener reservas del usuario: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Verificar disponibilidad de una cancha
   */
  async verificarDisponibilidad(canchaId: number, fechaInicio: string, fechaFin: string, reservaId?: number): Promise<{ disponible: boolean; mensaje?: string }> {
    try {
      const body = { canchaId, fechaInicio, fechaFin, reservaId };
      const response = await apiBackend.post('/api/reservas/verificar-disponibilidad', body);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al verificar disponibilidad: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Confirmar pago de una reserva
   */
  async confirmarPago(id: number): Promise<Reserva> {
    try {
      const response = await apiBackend.post(`/api/reservas/${id}/confirmar-pago`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al confirmar pago: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Cancelar una reserva
   */
  async cancelarReserva(id: number): Promise<Reserva> {
    try {
      const response = await apiBackend.post(`/api/reservas/${id}/cancelar`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al cancelar reserva: ' + (error.response?.data?.error || error.message));
    }
  }
};
