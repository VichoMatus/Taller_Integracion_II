import { apiBackend } from '../config/backend';
import {
  Complejo,
  Cancha,
  ReservaOwner,
  EstadisticasOwner,
  CreateComplejoInput,
  UpdateComplejoInput,
  CreateCanchaInput,
  UpdateCanchaInput,
  FiltrosReservasInput,
  MisRecursosResponse,
  AdminStatusResponse
} from '../types/admin';

/**
 * Servicio para operaciones del módulo Admin/Owner
 * Maneja la gestión de complejos, canchas y estadísticas para dueños
 */
export const adminService = {

  // ========================================
  // PANEL OWNER (MIS RECURSOS)
  // ========================================

  /**
   * Obtener resumen de recursos del owner
   */
  async getMisRecursos(): Promise<MisRecursosResponse> {
    try {
      const response = await apiBackend.get('/admin/panel');
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener mis recursos: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener estadísticas del owner
   */
  async getMisEstadisticas(): Promise<EstadisticasOwner> {
    try {
      const response = await apiBackend.get('/admin/estadisticas');
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener estadísticas: ' + (error.response?.data?.message || error.message));
    }
  },

  // ========================================
  // GESTIÓN DE COMPLEJOS
  // ========================================

  /**
   * Obtener complejos del owner
   */
  async getMisComplejos(): Promise<Complejo[]> {
    try {
      const response = await apiBackend.get('/admin/complejos');
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener complejos: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Crear nuevo complejo
   */
  async createComplejo(data: CreateComplejoInput): Promise<Complejo> {
    try {
      const response = await apiBackend.post('/admin/complejos', data);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al crear complejo: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener complejo específico
   */
  async getComplejo(id: number): Promise<Complejo> {
    try {
      const response = await apiBackend.get(`/admin/complejos/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener complejo: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Actualizar complejo
   */
  async updateComplejo(id: number, data: UpdateComplejoInput): Promise<Complejo> {
    try {
      const response = await apiBackend.put(`/admin/complejos/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al actualizar complejo: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Eliminar complejo
   */
  async deleteComplejo(id: number): Promise<void> {
    try {
      await apiBackend.delete(`/admin/complejos/${id}`);
    } catch (error: any) {
      throw new Error('Error al eliminar complejo: ' + (error.response?.data?.message || error.message));
    }
  },

  // ========================================
  // GESTIÓN DE CANCHAS
  // ========================================

  /**
   * Obtener canchas del owner
   */
  async getMisCanchas(): Promise<Cancha[]> {
    try {
      const response = await apiBackend.get('/admin/canchas');
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener canchas: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Crear nueva cancha
   */
  async createCancha(data: CreateCanchaInput): Promise<Cancha> {
    try {
      const response = await apiBackend.post('/admin/canchas', data);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al crear cancha: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener cancha específica
   */
  async getCancha(id: number): Promise<Cancha> {
    try {
      const response = await apiBackend.get(`/admin/canchas/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener cancha: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Actualizar cancha
   */
  async updateCancha(id: number, data: UpdateCanchaInput): Promise<Cancha> {
    try {
      const response = await apiBackend.put(`/admin/canchas/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al actualizar cancha: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Eliminar cancha
   */
  async deleteCancha(id: number): Promise<void> {
    try {
      await apiBackend.delete(`/admin/canchas/${id}`);
    } catch (error: any) {
      throw new Error('Error al eliminar cancha: ' + (error.response?.data?.message || error.message));
    }
  },

  // ========================================
  // GESTIÓN DE RESERVAS
  // ========================================

  /**
   * Obtener reservas del owner con filtros opcionales
   */
  async getMisReservas(filtros?: FiltrosReservasInput): Promise<ReservaOwner[]> {
    try {
      const response = await apiBackend.get('/admin/reservas', { params: filtros });
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener reservas: ' + (error.response?.data?.message || error.message));
    }
  },

  // ========================================
  // UTILIDADES Y STATUS
  // ========================================

  /**
   * Verificar estado del módulo admin
   */
  async getStatus(): Promise<AdminStatusResponse> {
    try {
      const response = await apiBackend.get('/admin/status');
      return response.data;
    } catch (error: any) {
      throw new Error('Error al verificar status: ' + (error.response?.data?.message || error.message));
    }
  },

  // ========================================
  // MÉTODOS HELPER
  // ========================================

  /**
   * Obtener resumen completo del dashboard
   */
  async getDashboardData() {
    try {
      const [recursos, estadisticas] = await Promise.all([
        this.getMisRecursos(),
        this.getMisEstadisticas()
      ]);

      return {
        ...recursos,
        estadisticas
      };
    } catch (error: any) {
      throw new Error('Error al obtener datos del dashboard: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener datos para el detalle de un complejo
   */
  async getComplejoDetalle(complejoId: number) {
    try {
      const [complejo, canchas, reservas] = await Promise.all([
        this.getComplejo(complejoId),
        this.getMisCanchas(),
        this.getMisReservas()
      ]);

      // Filtrar canchas del complejo específico
      const canchasComplejo = canchas.filter(c => c.establecimientoId === complejoId);
      
      // Filtrar reservas de las canchas del complejo
      const canchaIds = canchasComplejo.map(c => c.id);
      const reservasComplejo = reservas.filter(r => canchaIds.includes(r.cancha_id));

      return {
        complejo,
        canchas: canchasComplejo,
        reservas: reservasComplejo,
        totalCanchas: canchasComplejo.length,
        totalReservas: reservasComplejo.length,
        ingresosTotales: reservasComplejo.reduce((sum, r) => sum + r.precio_total, 0)
      };
    } catch (error: any) {
      throw new Error('Error al obtener detalle del complejo: ' + (error.response?.data?.message || error.message));
    }
  }
};