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
    const response = await apiBackend.get('/api/reservas', { params: filters });
    return response.data;
  },

  /**
   * Obtener una reserva por ID
   */
  async getReservaById(id: number): Promise<Reserva> {
    const response = await apiBackend.get(`/api/reservas/${id}`);
    return response.data;
  },

  /**
   * Crear una nueva reserva
   */
  async createReserva(input: CreateReservaInput): Promise<Reserva> {
    const response = await apiBackend.post('/api/reservas', input);
    return response.data;
  },

  /**
   * Actualizar una reserva existente
   */
  async updateReserva(id: number, input: UpdateReservaInput): Promise<Reserva> {
    const response = await apiBackend.patch(`/api/reservas/${id}`, input);
    return response.data;
  },

  /**
   * Eliminar una reserva
   */
  async deleteReserva(id: number): Promise<void> {
    await apiBackend.delete(`/api/reservas/${id}`);
  },

  /**
   * Obtener reservas de un usuario
   */
  async getReservasByUsuario(usuarioId: number): Promise<Reserva[]> {
    const response = await apiBackend.get(`/api/reservas/usuario/${usuarioId}`);
    return response.data;
  },

  /**
   * Verificar disponibilidad de una cancha
   */
  async verificarDisponibilidad(canchaId: number, fechaInicio: string, fechaFin: string, reservaId?: number): Promise<{ disponible: boolean; mensaje?: string }> {
    const body = { canchaId, fechaInicio, fechaFin, reservaId };
    const response = await apiBackend.post('/api/reservas/verificar-disponibilidad', body);
    return response.data;
  },

  /**
   * Confirmar pago de una reserva
   */
  async confirmarPago(id: number): Promise<Reserva> {
    const response = await apiBackend.post(`/api/reservas/${id}/confirmar-pago`);
    return response.data;
  },

  /**
   * Cancelar una reserva
   */
  async cancelarReserva(id: number): Promise<Reserva> {
    const response = await apiBackend.post(`/api/reservas/${id}/cancelar`);
    return response.data;
  }
};
