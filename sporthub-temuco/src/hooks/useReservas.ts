/**
 * Hook personalizado para el manejo de reservas
 * Utiliza los nuevos endpoints actualizados
 */

import { useState, useEffect, useCallback } from 'react';
import { reservaService } from '../services/reservaService';
import { 
  Reserva, 
  ReservaFilters, 
  CreateReservaInput, 
  CreateReservaInputNew,
  CotizacionInputNew,
  CotizacionResponseNew
} from '../types/reserva';

export interface UseReservasOptions {
  autoLoad?: boolean;
  filters?: ReservaFilters;
}

export interface UseReservasReturn {
  reservas: Reserva[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createReserva: (input: CreateReservaInput | CreateReservaInputNew) => Promise<boolean>;
  cotizarReserva: (input: CotizacionInputNew) => Promise<CotizacionResponseNew | null>;
  cancelarReserva: (id: number) => Promise<boolean>;
  confirmarReserva: (id: number) => Promise<boolean>;
}

/**
 * Hook principal para gestión de reservas
 */
export const useReservas = (options: UseReservasOptions = {}): UseReservasReturn => {
  const { autoLoad = true, filters } = options;
  
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await reservaService.getReservas(filters);
      setReservas(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar reservas');
      console.error('Error al cargar reservas:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createReserva = useCallback(async (input: CreateReservaInput | CreateReservaInputNew): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await reservaService.createReserva(input);
      await refetch(); // Recargar lista después de crear
      
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al crear reserva');
      console.error('Error al crear reserva:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const cotizarReserva = useCallback(async (input: CotizacionInputNew): Promise<CotizacionResponseNew | null> => {
    try {
      setError(null);
      return await reservaService.cotizarReserva(input);
    } catch (err: any) {
      setError(err?.message || 'Error al cotizar reserva');
      console.error('Error al cotizar reserva:', err);
      return null;
    }
  }, []);

  const cancelarReserva = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await reservaService.cancelarReserva(id);
      await refetch(); // Recargar lista después de cancelar
      
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al cancelar reserva');
      console.error('Error al cancelar reserva:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const confirmarReserva = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await reservaService.confirmarReserva(id);
      await refetch(); // Recargar lista después de confirmar
      
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al confirmar reserva');
      console.error('Error al confirmar reserva:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  useEffect(() => {
    if (autoLoad) {
      refetch();
    }
  }, [autoLoad, refetch]);

  return {
    reservas,
    loading,
    error,
    refetch,
    createReserva,
    cotizarReserva,
    cancelarReserva,
    confirmarReserva
  };
};

/**
 * Hook específico para "Mis Reservas" (usuario autenticado)
 */
export const useMisReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para mapear la respuesta de la API a tipo Reserva
   */
  const mapApiReserva = (r: any): Reserva => {
    console.log("🔍 [useMisReservas] Mapeando reserva:", r);
    
    const fechaReserva = r.fecha_reserva || "";
    const horaInicio = r.hora_inicio || "";
    const horaFin = r.hora_fin || "";
    
    // Combinar fecha y hora
    const fechaInicio = fechaReserva && horaInicio 
      ? `${fechaReserva}T${horaInicio}` 
      : horaInicio || fechaReserva || "";
    
    const fechaFin = fechaReserva && horaFin 
      ? `${fechaReserva}T${horaFin}` 
      : horaFin || fechaReserva || "";
    
    return {
      id: Number(r.id_reserva || r.id || 0),
      usuarioId: Number(r.id_usuario || r.usuario_id || 0),
      canchaId: Number(r.id_cancha || r.cancha_id || 0),
      complejoId: Number(r.id_complejo || r.complejo_id || 0),
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      estado: r.estado || "pendiente",
      precioTotal: Number(r.precio_total || r.monto_total || 0),
      metodoPago: r.metodo_pago || undefined,
      pagado: !!r.pagado,
      notas: r.notas || undefined,
      fechaCreacion: r.fecha_creacion || "",
      fechaActualizacion: r.fecha_actualizacion || "",
      codigoConfirmacion: r.codigo_confirmacion || undefined,
      usuario: r.usuario || undefined,
      cancha: r.cancha || undefined,
      complejo: r.complejo || undefined,
    };
  };

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useMisReservas] Cargando mis reservas...');
      const data = await reservaService.getMisReservas();
      console.log('📦 [useMisReservas] Respuesta de API:', data);
      
      if (Array.isArray(data)) {
        console.log(`✅ [useMisReservas] Se encontraron ${data.length} reservas`);
        
        if (data.length === 0) {
          console.log('ℹ️ [useMisReservas] No hay reservas para mostrar');
          setReservas([]);
        } else {
          const reservasMapeadas = data.map((reserva, index) => {
            console.log(`🔄 [useMisReservas] Mapeando reserva ${index + 1}:`, reserva);
            return mapApiReserva(reserva);
          });
          
          console.log('✅ [useMisReservas] Reservas mapeadas exitosamente:', reservasMapeadas.length);
          setReservas(reservasMapeadas);
        }
      } else {
        console.warn('⚠️ [useMisReservas] La respuesta no es un array:', data);
        setReservas([]);
      }
    } catch (err: any) {
      console.error('❌ [useMisReservas] Error al cargar mis reservas:', err);
      
      if (err.response?.status === 404) {
        console.log('ℹ️ [useMisReservas] No se encontraron reservas (404)');
        setReservas([]);
        setError(null);
      } else {
        setError(err?.message || 'Error al cargar mis reservas');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelarReserva = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 [useMisReservas] Cancelando reserva ${id}...`);
      await reservaService.cancelarReserva(id);
      console.log(`✅ [useMisReservas] Reserva ${id} cancelada exitosamente`);
      
      await refetch(); // Recargar después de cancelar
      
      return true;
    } catch (err: any) {
      console.error(`❌ [useMisReservas] Error al cancelar reserva ${id}:`, err);
      setError(err?.message || 'Error al cancelar reserva');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    reservas,
    loading,
    error,
    refetch,
    cancelarReserva
  };
};

/**
 * Hook para administradores con funcionalidades extendidas
 */
export const useReservasAdmin = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReservasByCancha = useCallback(async (canchaId: number, filters?: ReservaFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await reservaService.getReservasByCancha(canchaId, filters);
      setReservas(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar reservas de cancha');
      console.error('Error al cargar reservas de cancha:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getReservasByUsuario = useCallback(async (usuarioId: number, filters?: ReservaFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await reservaService.getReservasByUsuarioAdmin(usuarioId, filters);
      setReservas(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar reservas de usuario');
      console.error('Error al cargar reservas de usuario:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReservaAdmin = useCallback(async (input: CreateReservaInput): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await reservaService.createReservaAdmin(input);
      
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al crear reserva como admin');
      console.error('Error al crear reserva como admin:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelarReservaAdmin = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await reservaService.cancelarReservaAdmin(id);
      
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al cancelar reserva como admin');
      console.error('Error al cancelar reserva como admin:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reservas,
    loading,
    error,
    getReservasByCancha,
    getReservasByUsuario,
    createReservaAdmin,
    cancelarReservaAdmin
  };
};
