/**
 * 🆕 HOOKS DE RESERVAS EXCLUSIVOS PARA USUARIOS NORMALES
 * 
 * Este archivo contiene SOLO los hooks para usuarios normales.
 * Usa el servicio reservaServiceUsuario que llama a /api/v1/reservas/*
 * 
 * ⚠️ NO USAR EN ADMIN - El admin usa useReservas.ts (legacy)
 * 
 * Creado: 16 nov 2025
 * Propósito: Separación completa entre funcionalidades de usuario y admin
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import reservaServiceUsuario from '@/services/reservaServiceUsuario';
import type { Reserva } from '@/types/reserva'; // Importar el tipo del frontend

// ==========================================
// TIPOS
// ==========================================

interface UseReservasUsuarioReturn {
  reservas: Reserva[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  cancelarReserva: (id: number) => Promise<void>;
}

// ==========================================
// FUNCIÓN DE MAPEO: API → Frontend
// ==========================================

/**
 * Mapea los datos de la API a la interfaz Reserva del frontend
 */
const mapApiReservaToFrontend = (r: any): Reserva => {
  return {
    id: r.id_reserva || r.id || 0,
    usuarioId: r.id_usuario || r.usuario_id || 0,
    canchaId: r.id_cancha || r.cancha_id || 0,
    complejoId: r.id_complejo || r.complejo_id || 0,
    fechaInicio: r.fecha_reserva ? `${r.fecha_reserva}T${r.hora_inicio || '00:00'}:00Z` : "",
    fechaFin: r.fecha_reserva ? `${r.fecha_reserva}T${r.hora_fin || '23:59'}:00Z` : "",
    estado: r.estado || "pendiente",
    precioTotal: r.precio_total || r.monto_total || 0,
    metodoPago: r.metodo_pago || undefined,
    pagado: r.pagado || r.estado_pago === 'pagado' || false,
    notas: r.notas || undefined,
    fechaCreacion: r.fecha_creacion || r.createdAt || "",
    fechaActualizacion: r.fecha_actualizacion || r.updatedAt || "",
    codigoConfirmacion: r.codigo_confirmacion || undefined,
    usuario: r.usuario || undefined,
    cancha: r.cancha || undefined,
    complejo: r.complejo || undefined,
  };
};

// ==========================================
// HOOK: Mis Reservas (Usuario Normal)
// ==========================================

/**
 * Hook para obtener y gestionar las reservas del usuario autenticado
 * 🆕 Usa el endpoint /api/v1/reservas/mias
 * ✅ Solo para usuarios normales (no admin)
 */
export const useMisReservasUsuario = (): UseReservasUsuarioReturn => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useMisReservasUsuario] Iniciando fetch de reservas...');
      
      const data = await reservaServiceUsuario.getMisReservas();
      
      console.log('✅ [useMisReservasUsuario] Reservas obtenidas:', data?.length || 0);
      
      // Mapear los datos de la API al formato del frontend
      const reservasMapeadas = Array.isArray(data) 
        ? data.map(mapApiReservaToFrontend)
        : [];
      
      setReservas(reservasMapeadas);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las reservas';
      console.error('❌ [useMisReservasUsuario] Error:', errorMessage);
      setError(errorMessage);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const cancelarReserva = async (id: number) => {
    try {
      console.log(`🗑️ [useMisReservasUsuario] Cancelando reserva ${id}...`);
      await reservaServiceUsuario.cancelarReserva(id);
      console.log(`✅ [useMisReservasUsuario] Reserva ${id} cancelada`);
      
      // Actualizar la lista de reservas
      setReservas(prev => 
        prev.map(r => 
          r.id === id ? { ...r, estado: 'cancelada' as const } : r
        )
      );
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cancelar la reserva';
      console.error('❌ [useMisReservasUsuario] Error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    reservas,
    loading,
    error,
    refetch: fetchReservas,
    cancelarReserva,
  };
};

// ==========================================
// EXPORTACIÓN POR DEFECTO
// ==========================================

export default {
  useMisReservasUsuario,
};
