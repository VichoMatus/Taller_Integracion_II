/**
 * 🆕 SERVICIO DE RESERVAS EXCLUSIVO PARA USUARIOS NORMALES
 * 
 * Este archivo contiene SOLO las funcionalidades para usuarios normales.
 * Usa los nuevos endpoints V1: /api/v1/reservas/*
 * 
 * ⚠️ NO USAR EN ADMIN - El admin usa reservaService.ts (legacy)
 * 
 * Creado: 16 nov 2025
 * Propósito: Separación completa entre funcionalidades de usuario y admin
 */

import { apiBackend } from '@/config/backend';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

export interface Reserva {
  id: number;
  usuario_id: number;
  cancha_id: number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  monto_total: number;
  metodo_pago?: string;
  estado_pago: 'pendiente' | 'pagado' | 'reembolsado';
  createdAt: string;
  updatedAt: string;
  cancha?: {
    id: number;
    nombre: string;
    tipo_deporte: string;
    complejo?: {
      id: number;
      nombre: string;
    };
  };
  usuario?: {
    id: number;
    nombre: string;
    email: string;
  };
}

export interface CreateReservaInputUsuario {
  cancha_id: number;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fin: string; // HH:MM
  monto_total: number;
  metodo_pago?: string;
}

// ==========================================
// MANEJO DE ERRORES
// ==========================================

const handleApiError = (err: any): never => {
  if (err.response) {
    const message = err.response.data?.message || err.response.data?.error || 'Error en el servidor';
    throw new Error(message);
  } else if (err.request) {
    throw new Error('No se pudo conectar con el servidor');
  } else {
    throw new Error(err.message || 'Error desconocido');
  }
};

// ==========================================
// SERVICIO DE RESERVAS PARA USUARIOS
// ==========================================

export const reservaServiceUsuario = {
  /**
   * Obtener mis reservas como usuario normal
   * 🆕 Endpoint: GET /api/v1/reservas/mias
   * ✅ Requiere: autenticación (usuario normal)
   */
  async getMisReservas(): Promise<Reserva[]> {
    try {
      console.log('🔍 [reservaServiceUsuario.getMisReservas] Obteniendo mis reservas desde /v1/reservas/mias');
      const { data } = await apiBackend.get('/v1/reservas/mias');
      console.log('📦 [reservaServiceUsuario.getMisReservas] Respuesta completa:', data);
      console.log('✅ [reservaServiceUsuario.getMisReservas] Reservas obtenidas:', Array.isArray(data) ? data.length : 'formato inesperado');
      
      // La respuesta puede venir directamente como array o envuelta
      return Array.isArray(data) ? data : (data.items || data.data || []);
    } catch (err: any) {
      console.error('❌ [reservaServiceUsuario.getMisReservas] Error:', err);
      return handleApiError(err);
    }
  },

  /**
   * Crear nueva reserva como usuario normal
   * 🆕 Endpoint: POST /api/v1/reservas
   * ✅ Requiere: autenticación (usuario normal)
   */
  async createReserva(input: any): Promise<Reserva> {
    try {
      console.log('📤 [reservaServiceUsuario.createReserva] Enviando reserva a /v1/reservas:', input);
      const { data } = await apiBackend.post('/v1/reservas', input);
      console.log('📦 [reservaServiceUsuario.createReserva] Respuesta completa:', data);
      console.log('✅ [reservaServiceUsuario.createReserva] Reserva creada:', data.data || data);
      
      // La respuesta puede venir como { data: reserva } o directamente la reserva
      return data.data || data;
    } catch (err: any) {
      console.error('❌ [reservaServiceUsuario.createReserva] Error:', err);
      return handleApiError(err);
    }
  },

  /**
   * Obtener una reserva por ID
   * 🆕 Endpoint: GET /api/v1/reservas/:id
   * ✅ Requiere: autenticación (usuario normal)
   */
  async getReservaById(id: number): Promise<Reserva> {
    try {
      console.log(`🔍 [reservaServiceUsuario.getReservaById] Obteniendo reserva ${id} desde /v1/reservas/${id}`);
      const { data } = await apiBackend.get(`/v1/reservas/${id}`);
      console.log(`📦 [reservaServiceUsuario.getReservaById] Respuesta completa:`, data);
      console.log(`✅ [reservaServiceUsuario.getReservaById] Reserva obtenida:`, data.data || data);
      
      return data.data || data;
    } catch (err: any) {
      console.error(`❌ [reservaServiceUsuario.getReservaById] Error:`, err);
      return handleApiError(err);
    }
  },

  /**
   * Cancelar una reserva
   * 🆕 Endpoint: DELETE /api/v1/reservas/:id
   * ✅ Requiere: autenticación (usuario normal, solo puede cancelar sus propias reservas)
   */
  async cancelarReserva(id: number): Promise<{ message: string }> {
    try {
      console.log(`🗑️ [reservaServiceUsuario.cancelarReserva] Cancelando reserva ${id}`);
      const { data } = await apiBackend.delete(`/v1/reservas/${id}`);
      console.log(`✅ [reservaServiceUsuario.cancelarReserva] Reserva cancelada:`, data);
      
      return data;
    } catch (err: any) {
      console.error(`❌ [reservaServiceUsuario.cancelarReserva] Error:`, err);
      return handleApiError(err);
    }
  },

  /**
   * Health check del servicio
   * 🆕 Endpoint: GET /api/v1/reservas/health
   * ✅ Público (sin autenticación)
   */
  async healthCheck(): Promise<any> {
    try {
      console.log('🏥 [reservaServiceUsuario.healthCheck] Verificando estado del servicio');
      const { data } = await apiBackend.get('/v1/reservas/health');
      console.log('✅ [reservaServiceUsuario.healthCheck] Respuesta:', data);
      return data;
    } catch (err: any) {
      console.warn('⚠️ [reservaServiceUsuario.healthCheck] Servicio no disponible:', err.message);
      return { ok: false, error: err.message };
    }
  },
};

export default reservaServiceUsuario;
