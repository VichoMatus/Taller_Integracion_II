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
  NoShowResponse,
  // Nuevos tipos actualizados
  CreateReservaInputNew,
  UpdateReservaInputNew,
  CotizacionInputNew,
  CotizacionResponseNew
} from '../types/reserva';
import { handleApiError } from "../services/ApiError";

export const reservaService = {
  /**
   * Obtener todas las reservas con filtros (admin/superadmin)
   * Actualizado para usar el nuevo endpoint
   */
  async getReservas(filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      const { data } = await apiBackend.get('/reservas', { params: filters });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Obtener una reserva por ID
   * Actualizado para usar el nuevo endpoint
   */
  async getReservaById(id: number): Promise<Reserva> {
    try {
      const { data } = await apiBackend.get(`/reservas/${id}`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Crear nueva reserva (soporta ambos formatos: nuevo y legacy)
   * Actualizado para usar el nuevo endpoint
   */
  async createReserva(input: CreateReservaInput | CreateReservaInputNew): Promise<Reserva> {
    try {
      const { data } = await apiBackend.post('/reservas', input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Cotizar precio de reserva (NUEVO ENDPOINT)
   */
  async cotizarReserva(input: CotizacionInputNew): Promise<CotizacionResponseNew> {
    try {
      const { data } = await apiBackend.post('/reservas/cotizar', input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Actualizar/reprogramar reserva
   * Actualizado para usar el nuevo endpoint
   */
  async updateReserva(id: number, input: UpdateReservaInput | UpdateReservaInputNew): Promise<Reserva> {
    try {
      const { data } = await apiBackend.patch(`/reservas/${id}`, input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async deleteReserva(id: number): Promise<void> {
    try {
      await apiBackend.delete(`/reservas/${id}`);
    } catch (err) {
      handleApiError(err);
    }
  },



  /**
   * Obtener mis reservas (usuario autenticado)
   * Actualizado para usar el nuevo endpoint /reservas/mias
   */
  async getMisReservas(): Promise<Reserva[]> {
    try {
      console.log("Intentando acceder a endpoint actualizado:", '/reservas/mias');
      
      const { data } = await apiBackend.get('/reservas/mias');
      
      console.log("Respuesta mis reservas (endpoint actualizado):", data);
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


  /**
   * Confirmar reserva (admin/superadmin)
   * Actualizado para usar el nuevo endpoint
   */
  async confirmarReserva(id: number): Promise<ConfirmarReservaResponse> {
    try {
      const { data } = await apiBackend.post(`/reservas/${id}/confirmar`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async checkInReserva(id: number): Promise<CheckInResponse> {
    try {
      const { data } = await apiBackend.post(`/reservas/${id}/check-in`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async noShowReserva(id: number): Promise<NoShowResponse> {
    try {
      const { data } = await apiBackend.post(`/reservas/${id}/no-show`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async cancelarReserva(id: number): Promise<Reserva> {
    try {
      const { data } = await apiBackend.post(`/reservas/${id}/cancelar`);
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
      console.log('🔍 [getAdminReservas] Iniciando petición con filtros:', filters);
      console.log('🔍 [getAdminReservas] URL base:', apiBackend.defaults.baseURL);
      console.log('🔍 [getAdminReservas] Ruta:', '/reservas');
      console.log('🔍 [getAdminReservas] URL completa esperada:', `${apiBackend.defaults.baseURL}/reservas`);
      
      const { data } = await apiBackend.get('/reservas', { params: filters });
      
      console.log('✅ [getAdminReservas] Respuesta recibida:', data);
      return data;
    } catch (err) {
      console.error('❌ [getAdminReservas] Error capturado:', err);
      handleApiError(err);
    }
  },

  /**
   * Obtener todas las reservas (lista completa admin)
   * Requiere rol admin o super_admin
   */
  async getAllReservasAdmin(filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      const { data } = await apiBackend.get('/reservas', { params: filters });
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
      const { data } = await apiBackend.get(`/reservas/admin/cancha/${canchaId}`, { params: filters });
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
      const { data } = await apiBackend.get(`/reservas/admin/usuario/${usuarioId}`, { params: filters });
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
      const { data } = await apiBackend.post('/reservas/admin/crear', input);
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
      const { data } = await apiBackend.post(`/reservas/admin/${id}/cancelar`);
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
      await apiBackend.delete(`/reservas/${id}`);
    } catch (err) {
      handleApiError(err);
    }
  },

  // ==========================================
  // MÉTODOS DE UTILIDAD Y ESTADO
  // ==========================================

  /**
   * Verificar estado del módulo de reservas
   * Nuevo método para verificar endpoints disponibles
   */
  async getReservasStatus(): Promise<any> {
    try {
      const { data } = await apiBackend.get('/reservas/status');
      return data;
    } catch (err) {
      console.warn('No se pudo obtener el estado del módulo reservas:', err);
      return { ok: false, error: 'Módulo no disponible' };
    }
  },

  /**
   * Método helper para convertir formato legacy a nuevo formato
   */
  convertirAFormatoNuevo(input: CreateReservaInput): CreateReservaInputNew {
    // Extraer fecha y hora de las strings ISO
    const fechaInicio = new Date(input.fechaInicio);
    const fechaFin = new Date(input.fechaFin);
    
    return {
      id_cancha: input.canchaId,
      fecha: fechaInicio.toISOString().split('T')[0], // YYYY-MM-DD
      inicio: fechaInicio.toTimeString().slice(0, 5), // HH:MM
      fin: fechaFin.toTimeString().slice(0, 5), // HH:MM
      notas: input.notas
    };
  },

  /**
   * Método helper para convertir formato nuevo a legacy
   */
  convertirAFormatoLegacy(input: CreateReservaInputNew): CreateReservaInput {
    // Construir fechas ISO completas
    const fechaInicio = `${input.fecha}T${input.inicio}:00`;
    const fechaFin = `${input.fecha}T${input.fin}:00`;
    
    return {
      usuarioId: 0, // Se debe asignar por el contexto del usuario
      canchaId: input.id_cancha,
      fechaInicio,
      fechaFin,
      notas: input.notas
    };
  }
};
