/**
 * SERVICIO DE RESERVAS - SINCRONIZADO CON BACKEND
 * ================================================
 * ✅ 100% sincronizado con backend/src/reservas/presentation/routes/reservas.routes.ts
 * ⚠️ Solo contiene endpoints que existen en el backend
 * 🗑️ Funcionalidades fantasma eliminadas
 * 
 * Última sincronización: 27 de octubre de 2025
 */

import { apiBackend } from '../config/backend';
import {
  Reserva,
  ReservaFilters,
  CreateReservaInput,
  UpdateReservaInput,
  CotizacionResponse,
  ConfirmarReservaResponse,
  // Nuevos tipos actualizados
  CreateReservaInputNew,
  CreateReservaAdminInput,
  UpdateReservaInputNew,
  CotizacionInputNew,
  CotizacionResponseNew
} from '../types/reserva';
import { handleApiError } from "../services/ApiError";

/**
 * Servicio de Reservas
 * Todos los métodos están sincronizados 1:1 con los endpoints del backend
 */
export const reservaService = {
  /**
   * Obtener todas las reservas con filtros (admin/superadmin)
   * ✅ Backend: GET /reservas
   * ✅ Requiere: admin o super_admin
   */
  async getReservas(filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      console.log('🔍 [getReservas] Obteniendo todas las reservas (admin)');
      const { data } = await apiBackend.get('/reservas', { params: filters });
      console.log('📦 [getReservas] Respuesta completa:', data);
      // Backend envía { ok: true, data: { items: [...], total, page, pageSize } }
      const reservas = data.data?.items || data.items || data.data || data;
      console.log('✅ [getReservas] Reservas obtenidas:', Array.isArray(reservas) ? reservas.length : 'formato inesperado');
      return reservas;
    } catch (err) {
      console.error('❌ [getReservas] Error:', err);
      handleApiError(err);
    }
  },

  /**
   * Obtener una reserva por ID
   * ✅ Backend: GET /reservas/:id
   * ✅ Requiere: autenticación (usuario/admin/super_admin)
   */
  async getReservaById(id: number): Promise<Reserva> {
    try {
      console.log(`🔍 [getReservaById] Obteniendo reserva ${id}`);
      const { data } = await apiBackend.get(`/reservas/${id}`);
      console.log(`📦 [getReservaById] Respuesta completa:`, data);
      console.log(`✅ [getReservaById] Reserva obtenida:`, data.data);
      // Backend envía { ok: true, data: reserva }, necesitamos extraer data.data
      return data.data || data;
    } catch (err) {
      console.error(`❌ [getReservaById] Error:`, err);
      handleApiError(err);
    }
  },

  /**
   * Crear nueva reserva (soporta ambos formatos: nuevo y legacy) - VERSIÓN LEGACY
   * ✅ Backend: POST /reservas
   * ✅ Requiere: autenticación (usuario/admin/super_admin)
   * ⚠️ USADO POR ADMIN - NO MODIFICAR
   */
  async createReserva(input: CreateReservaInput | CreateReservaInputNew): Promise<Reserva> {
    try {
      console.log('🔍 [createReserva] Creando reserva en /reservas (LEGACY):', input);
      const { data } = await apiBackend.post('/reservas', input);
      console.log('📦 [createReserva] Respuesta completa:', data);
      console.log('✅ [createReserva] Reserva creada:', data.data);
      // Backend envía { ok: true, data: reserva }, necesitamos extraer data.data
      return data.data || data;
    } catch (err) {
      console.error('❌ [createReserva] Error:', err);
      handleApiError(err);
    }
  },

  /**
   * Cotizar precio de reserva
   * ✅ Backend: POST /reservas/cotizar
   * ✅ Requiere: autenticación (usuario/admin/super_admin)
   */
  async cotizarReserva(input: CotizacionInputNew): Promise<CotizacionResponseNew> {
    try {
      console.log('🔍 [cotizarReserva] Cotizando:', input);
      const { data } = await apiBackend.post('/reservas/cotizar', input);
      console.log('✅ [cotizarReserva] Cotización obtenida:', data);
      return data;
    } catch (err) {
      console.error('❌ [cotizarReserva] Error:', err);
      handleApiError(err);
    }
  },

  /**
   * Actualizar/reprogramar reserva
   * ✅ Backend: PATCH /reservas/:id
   * ✅ Requiere: autenticación (usuario/admin/super_admin)
   */
  async updateReserva(id: number, input: UpdateReservaInput | UpdateReservaInputNew): Promise<Reserva> {
    try {
      console.log(`🔍 [updateReserva] Actualizando reserva ${id}:`, input);
      const { data } = await apiBackend.patch(`/reservas/${id}`, input);
      console.log(`📦 [updateReserva] Respuesta completa:`, data);
      console.log(`✅ [updateReserva] Reserva actualizada:`, data.data);
      // Backend envía { ok: true, data: reserva }, necesitamos extraer data.data
      return data.data || data;
    } catch (err) {
      console.error(`❌ [updateReserva] Error:`, err);
      handleApiError(err);
    }
  },

  /**
   * Cancelar reserva (usuario normal)
   * ✅ Backend: POST /reservas/:id/cancelar
   * ✅ Requiere: autenticación (usuario/admin/super_admin)
   * ⚠️ Nota: El backend NO tiene DELETE, usa POST /cancelar
   */
  async cancelarReserva(id: number): Promise<Reserva> {
    try {
      console.log(`🔍 [cancelarReserva] Cancelando reserva ${id}`);
      const { data } = await apiBackend.post(`/reservas/${id}/cancelar`);
      console.log(`✅ [cancelarReserva] Reserva cancelada:`, data);
      return data;
    } catch (err) {
      console.error(`❌ [cancelarReserva] Error:`, err);
      handleApiError(err);
    }
  },

  /**
   * Alias de cancelarReserva() para compatibilidad
   * ⚠️ El backend NO tiene DELETE, internamente usa POST /reservas/:id/cancelar
   */
  async deleteReserva(id: number): Promise<void> {
    try {
      console.log(`🔍 [deleteReserva] Cancelando reserva ${id} (alias de cancelarReserva)`);
      await apiBackend.post(`/reservas/${id}/cancelar`);
      console.log(`✅ [deleteReserva] Reserva cancelada exitosamente`);
    } catch (err) {
      console.error(`❌ [deleteReserva] Error:`, err);
      handleApiError(err);
    }
  },



  // ==========================================
  // ENDPOINTS PÚBLICOS
  // ==========================================

  /**
   * Verificar estado del módulo de reservas
   * ✅ Backend: GET /reservas/status (PÚBLICO - sin auth)
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

  // ==========================================
  // ENDPOINTS DE USUARIO AUTENTICADO (LEGACY - usado por admin)
  // ==========================================

  /**
   * Obtener mis reservas (usuario autenticado) - VERSIÓN LEGACY
   * ✅ Backend: GET /reservas/mias
   * ✅ Requiere: autenticación (cualquier usuario)
   * ⚠️ USADO POR ADMIN - NO MODIFICAR
   */
  async getMisReservas(): Promise<Reserva[]> {
    try {
      console.log('🔍 [getMisReservas] Obteniendo mis reservas desde /reservas/mias (LEGACY)');
      const { data } = await apiBackend.get('/reservas/mias');
      console.log('✅ [getMisReservas] Reservas obtenidas:', Array.isArray(data) ? data.length : 'formato inesperado');
      return Array.isArray(data) ? data : (data.items || data.data || []);
    } catch (err: any) {
      console.error('❌ [getMisReservas] Error:', err);
      handleApiError(err);
      return [];
    }
  },

  // ==========================================
  // ENDPOINTS ADMIN (requieren rol admin o super_admin)
  // ==========================================

  /**
   * Alias de getReservas() para el panel admin
   * ✅ Backend: GET /reservas
   * ✅ Requiere: admin o super_admin
   */
  async getAdminReservas(filters?: ReservaFilters): Promise<Reserva[]> {
    return this.getReservas(filters);
  },

  /**
   * Confirmar pago de reserva (admin)
   * ✅ Backend: POST /reservas/:id/confirmar
   * ✅ Requiere: admin o super_admin
   */
  async confirmarReserva(id: number): Promise<ConfirmarReservaResponse> {
    try {
      console.log(`🔍 [confirmarReserva] Confirmando reserva ${id}`);
      const { data } = await apiBackend.post(`/reservas/${id}/confirmar`);
      console.log(`✅ [confirmarReserva] Reserva confirmada:`, data);
      return data;
    } catch (err) {
      console.error(`❌ [confirmarReserva] Error:`, err);
      handleApiError(err);
    }
  },

  /**
   * Confirmar pago de reserva con método de pago específico (admin)
   * 🆕 NUEVO (6 nov 2025): Permite especificar método de pago (efectivo/transferencia/webpay)
   * ✅ Backend: POST /reservas/:id/confirmar
   * ✅ Requiere: admin o super_admin
   */
  async confirmarReservaConMetodo(id: number, metodoPago: string): Promise<ConfirmarReservaResponse> {
    try {
      console.log(`🔍 [confirmarReservaConMetodo] Confirmando reserva ${id} con método: ${metodoPago}`);
      const { data } = await apiBackend.post(`/reservas/${id}/confirmar`, { metodoPago });
      console.log(`✅ [confirmarReservaConMetodo] Reserva confirmada con método ${metodoPago}:`, data);
      return data;
    } catch (err: any) {
      console.error(`❌ [confirmarReservaConMetodo] Error:`, err);
      handleApiError(err);
    }
  },

  /**
   * Obtener reservas de una cancha específica (admin)
   * ✅ Backend: GET /reservas/admin/cancha/:canchaId
   * ✅ Requiere: admin o super_admin
   */
  async getReservasByCancha(canchaId: number, filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      console.log(`🔍 [getReservasByCancha] Obteniendo reservas de cancha ${canchaId}`);
      const { data } = await apiBackend.get(`/reservas/admin/cancha/${canchaId}`, { params: filters });
      console.log(`✅ [getReservasByCancha] Reservas obtenidas:`, data?.length || 0);
      return data;
    } catch (err) {
      console.error(`❌ [getReservasByCancha] Error:`, err);
      handleApiError(err);
    }
  },

  /**
   * Obtener reservas de un usuario específico (admin)
   * ✅ Backend: GET /reservas/admin/usuario/:usuarioId
   * ✅ Requiere: admin o super_admin
   */
  async getReservasByUsuarioAdmin(usuarioId: number, filters?: ReservaFilters): Promise<Reserva[]> {
    try {
      console.log(`🔍 [getReservasByUsuarioAdmin] Obteniendo reservas del usuario ${usuarioId}`);
      const { data } = await apiBackend.get(`/reservas/admin/usuario/${usuarioId}`, { params: filters });
      console.log(`✅ [getReservasByUsuarioAdmin] Reservas obtenidas:`, data?.length || 0);
      return data;
    } catch (err) {
      console.error(`❌ [getReservasByUsuarioAdmin] Error:`, err);
      handleApiError(err);
    }
  },

  /**
   * Crear reserva como administrador (para cualquier usuario)
   * ✅ Backend: POST /reservas/admin/crear
   * ✅ Requiere: admin o super_admin
   * ⚠️ Formato esperado: { id_cancha, fecha_reserva, hora_inicio, hora_fin, id_usuario }
   */
  async createReservaAdmin(input: CreateReservaAdminInput): Promise<Reserva> {
    try {
      console.log('🔍 [createReservaAdmin] Creando reserva como admin:', input);
      const { data } = await apiBackend.post('/reservas/admin/crear', input);
      console.log('✅ [createReservaAdmin] Reserva creada:', data);
      return data;
    } catch (err) {
      console.error('❌ [createReservaAdmin] Error:', err);
      handleApiError(err);
    }
  },

  /**
   * Cancelar reserva como administrador (forzar cancelación)
   * ✅ Backend: POST /reservas/admin/:id/cancelar
   * ✅ Requiere: admin o super_admin
   */
  async cancelarReservaAdmin(id: number): Promise<Reserva> {
    try {
      console.log(`🔍 [cancelarReservaAdmin] Cancelando reserva ${id} como admin`);
      const { data } = await apiBackend.post(`/reservas/admin/${id}/cancelar`);
      console.log(`✅ [cancelarReservaAdmin] Reserva cancelada:`, data);
      return data;
    } catch (err) {
      console.error(`❌ [cancelarReservaAdmin] Error:`, err);
      handleApiError(err);
    }
  },

  /**
   * Alias de cancelarReservaAdmin() para compatibilidad
   * ⚠️ El backend NO tiene DELETE, internamente usa POST /reservas/admin/:id/cancelar
   */
  async deleteReservaAdmin(id: number): Promise<void> {
    try {
      console.log(`🔍 [deleteReservaAdmin] Cancelando reserva ${id} como admin (alias)`);
      await apiBackend.post(`/reservas/admin/${id}/cancelar`);
      console.log(`✅ [deleteReservaAdmin] Reserva cancelada exitosamente`);
    } catch (err) {
      console.error(`❌ [deleteReservaAdmin] Error:`, err);
      handleApiError(err);
    }
  },

  // ==========================================
  // MÉTODOS DE UTILIDAD Y CONVERSIÓN DE FORMATOS
  // ==========================================

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