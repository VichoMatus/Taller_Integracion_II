import { apiBackend } from '../config/backend';
import {
  Reserva,
  ReservaFilters,
  CreateReservaInput,
  UpdateReservaInput,
  CotizacionInput,
  CotizacionResponse,
  ConfirmarReservaResponse,
  CheckInResponse,
  NoShowResponse
} from '../types/reserva';
import { handleApiError } from "../services/ApiError";

export const reservaService = {
  async getReservas(filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      const { data } = await apiBackend.get('/api/v1/reservas', { params: filters });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async getReservaById(id: number): Promise<Reserva> {
    try {
      const { data } = await apiBackend.get(`/api/v1/reservas/${id}`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async createReserva(input: CreateReservaInput): Promise<Reserva> {
    try {
      const { data } = await apiBackend.post('/api/v1/reservas', input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async updateReserva(id: number, input: UpdateReservaInput): Promise<Reserva> {
    try {
      const { data } = await apiBackend.patch(`/api/v1/reservas/${id}`, input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async deleteReserva(id: number): Promise<void> {
    try {
      await apiBackend.delete(`/api/v1/reservas/${id}`);
    } catch (err) {
      handleApiError(err);
    }
  },



    // ...existing code...
  async getMisReservas(): Promise<Reserva[]> {
    try {
      console.log("Intentando acceder a endpoint:", '/api/v1/reservas/mias');
      
      // Probar con la URL completa para evitar problemas de manipulación de URL
      const url = '/api/v1/reservas/mias';
      const { data } = await apiBackend.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      console.log("Respuesta mis reservas:", data);
      return Array.isArray(data) ? data : (data.items || data.data || []);
    } catch (err: any) {
      console.error("Error detallado al obtener mis reservas:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        baseURL: err.config?.baseURL
      });
      handleApiError(err);
      return []; // Devuelve array vacío en caso de error
    }
  },
  // ...existing code...


  async confirmarReserva(id: number): Promise<ConfirmarReservaResponse> {
    try {
      const { data } = await apiBackend.post(`/api/reservas/${id}/confirmar`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async checkInReserva(id: number): Promise<CheckInResponse> {
    try {
      const { data } = await apiBackend.post(`/api/reservas/${id}/check-in`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async noShowReserva(id: number): Promise<NoShowResponse> {
    try {
      const { data } = await apiBackend.post(`/api/reservas/${id}/no-show`);
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
  },

  // ==========================================
  // MÉTODOS ESPECÍFICOS PARA ADMIN
  // ==========================================

  /**
   * Obtener reservas del administrador (desde /admin/reservas)
   * Requiere rol admin o super_admin
   */
  async getAdminReservas(filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      const { data } = await apiBackend.get('/api/admin/reservas', { params: filters });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Obtener todas las reservas (lista completa admin)
   * Requiere rol admin o super_admin
   */
  async getAllReservasAdmin(filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      const { data } = await apiBackend.get('/api/reservas', { params: filters });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Obtener reservas de una cancha específica (admin)
   * Requiere rol admin o super_admin
   */
  async getReservasByCancha(canchaId: number, filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      const { data } = await apiBackend.get(`/api/reservas/admin/cancha/${canchaId}`, { params: filters });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Obtener reservas de un usuario específico (admin)
   * Requiere rol admin o super_admin
   */
  async getReservasByUsuarioAdmin(usuarioId: number, filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      const { data } = await apiBackend.get(`/api/reservas/admin/usuario/${usuarioId}`, { params: filters });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Crear reserva como administrador (para cualquier usuario)
   * Requiere rol admin o super_admin
   */
  async createReservaAdmin(input: CreateReservaInput): Promise<Reserva> {
    try {
      const { data } = await apiBackend.post('/api/reservas/admin/crear', input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Cancelar reserva como administrador (forzar cancelación)
   * Requiere rol admin o super_admin
   */
  async cancelarReservaAdmin(id: number): Promise<Reserva> {
    try {
      const { data } = await apiBackend.post(`/api/reservas/admin/${id}/cancelar`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Eliminar reserva permanentemente (admin)
   * Requiere rol admin o super_admin
   */
  async deleteReservaAdmin(id: number): Promise<void> {
    try {
      await apiBackend.delete(`/api/reservas/${id}`);
    } catch (err) {
      handleApiError(err);
    }
  }
};
