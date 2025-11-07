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

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await reservaService.getMisReservas();
      setReservas(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar mis reservas');
      console.error('Error al cargar mis reservas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelarReserva = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await reservaService.cancelarReserva(id);
      await refetch(); // Recargar después de cancelar
      
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al cancelar reserva');
      console.error('Error al cancelar reserva:', err);
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
