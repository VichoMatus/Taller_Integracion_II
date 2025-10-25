// hooks/useCanchas.ts
import { useState, useEffect, useCallback } from 'react';
import { canchaService } from '../services/canchaService';
import { 
  Cancha, 
  CanchaFilters, 
  CanchaAdminFilters, 
  CanchaListResponse,
  CreateCanchaInput,
  UpdateCanchaInput,
  FotoCancha,
  AddFotoInput
} from '../types/cancha';

/**
 * Hook principal para manejo de canchas
 * Incluye funcionalidades de Taller4: geolocalización, filtros avanzados
 */
export const useCanchas = (initialFilters?: CanchaFilters) => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 20
  });

  const fetchCanchas = useCallback(async (filters?: CanchaFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await canchaService.getCanchas(filters) as CanchaListResponse;
      setCanchas(response.items || []);
      
      if (response.total !== undefined) {
        setPagination({
          total: response.total,
          page: response.page || 1,
          page_size: response.page_size || 20
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las canchas');
      setCanchas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCanchas = useCallback(() => {
    fetchCanchas(initialFilters);
  }, [fetchCanchas, initialFilters]);

  useEffect(() => {
    fetchCanchas(initialFilters);
  }, [fetchCanchas, initialFilters]);

  return {
    canchas,
    loading,
    error,
    pagination,
    fetchCanchas,
    refreshCanchas,
    setCanchas
  };
};

/**
 * Hook para panel administrativo de canchas
 * Requiere autenticación admin/super_admin
 */
export const useCanchasAdmin = (initialFilters?: CanchaAdminFilters) => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 20
  });

  const fetchCanchasAdmin = useCallback(async (filters?: CanchaAdminFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await canchaService.getCanchasAdmin(filters) as CanchaListResponse;
      setCanchas(response.items || []);
      
      if (response.total !== undefined) {
        setPagination({
          total: response.total,
          page: response.page || 1,
          page_size: response.page_size || 20
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las canchas admin');
      setCanchas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCanchas = useCallback(() => {
    fetchCanchasAdmin(initialFilters);
  }, [fetchCanchasAdmin, initialFilters]);

  useEffect(() => {
    fetchCanchasAdmin(initialFilters);
  }, [fetchCanchasAdmin, initialFilters]);

  return {
    canchas,
    loading,
    error,
    pagination,
    fetchCanchasAdmin,
    refreshCanchas,
    setCanchas
  };
};

/**
 * Hook para detalle de cancha individual
 * Soporte para cálculo de distancia
 */
export const useCancha = (id: number, coords?: { lat: number; lon: number }) => {
  const [cancha, setCancha] = useState<Cancha | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCancha = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await canchaService.getCanchaById(id, coords);
      setCancha(response);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la cancha');
      setCancha(null);
    } finally {
      setLoading(false);
    }
  }, [id, coords]);

  const refreshCancha = useCallback(() => {
    fetchCancha();
  }, [fetchCancha]);

  useEffect(() => {
    fetchCancha();
  }, [fetchCancha]);

  return {
    cancha,
    loading,
    error,
    refreshCancha,
    setCancha
  };
};

/**
 * Hook para búsqueda geográfica de canchas
 * Nueva funcionalidad de Taller4
 */
export const useCanchasCercanas = () => {
  const [canchasCercanas, setCanchasCercanas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarCanchasCercanas = useCallback(async (
    lat: number, 
    lon: number, 
    maxKm: number = 10,
    filters?: {
      deporte?: string;
      cubierta?: boolean;
      max_precio?: number;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await canchaService.getCanchasCercanas(lat, lon, maxKm, filters) as CanchaListResponse;
      setCanchasCercanas(response.items || []);
    } catch (err: any) {
      setError(err.message || 'Error al buscar canchas cercanas');
      setCanchasCercanas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    canchasCercanas,
    loading,
    error,
    buscarCanchasCercanas,
    setCanchasCercanas
  };
};

/**
 * Hook para CRUD de canchas (admin)
 * Operaciones de creación, actualización y eliminación
 */
export const useCanchasCRUD = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createCancha = useCallback(async (input: CreateCanchaInput) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const newCancha = await canchaService.createCancha(input);
      setSuccess('Cancha creada exitosamente');
      return newCancha;
    } catch (err: any) {
      setError(err.message || 'Error al crear la cancha');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCancha = useCallback(async (id: number, input: UpdateCanchaInput) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedCancha = await canchaService.updateCancha(id, input);
      setSuccess('Cancha actualizada exitosamente');
      return updatedCancha;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la cancha');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCancha = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await canchaService.deleteCancha(id);
      setSuccess('Cancha eliminada exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la cancha');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    loading,
    error,
    success,
    createCancha,
    updateCancha,
    deleteCancha,
    clearMessages
  };
};

/**
 * Hook para gestión de fotos de canchas
 * CRUD completo para imágenes
 */
export const useFotosCanchas = (canchaId: number) => {
  const [fotos, setFotos] = useState<FotoCancha[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFotos = useCallback(async () => {
    if (!canchaId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await canchaService.getFotosCancha(canchaId);
      setFotos(response);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las fotos');
      setFotos([]);
    } finally {
      setLoading(false);
    }
  }, [canchaId]);

  const addFoto = useCallback(async (fotoData: AddFotoInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const newFoto = await canchaService.addFotoCancha(canchaId, fotoData);
      setFotos(prev => [...prev, newFoto]);
      return newFoto;
    } catch (err: any) {
      setError(err.message || 'Error al agregar la foto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [canchaId]);

  const deleteFoto = useCallback(async (fotoId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await canchaService.deleteFotoCancha(canchaId, fotoId);
      setFotos(prev => prev.filter(foto => foto.id !== fotoId));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la foto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [canchaId]);

  const refreshFotos = useCallback(() => {
    fetchFotos();
  }, [fetchFotos]);

  useEffect(() => {
    fetchFotos();
  }, [fetchFotos]);

  return {
    fotos,
    loading,
    error,
    addFoto,
    deleteFoto,
    refreshFotos,
    setFotos
  };
};

/**
 * Hook para filtros de canchas por deporte
 */
export const useCanchasByDeporte = (deporte: string) => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCanchasByDeporte = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await canchaService.getCanchasByDeporte(deporte, filters) as CanchaListResponse;
      setCanchas(response.items || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar canchas por deporte');
      setCanchas([]);
    } finally {
      setLoading(false);
    }
  }, [deporte]);

  useEffect(() => {
    if (deporte) {
      fetchCanchasByDeporte();
    }
  }, [fetchCanchasByDeporte, deporte]);

  return {
    canchas,
    loading,
    error,
    fetchCanchasByDeporte,
    setCanchas
  };
};

/**
 * Hook para estado del módulo de canchas
 * Diagnóstico y verificación de conectividad
 */
export const useCanchasStatus = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    
    try {
      const statusData = await canchaService.getCanchasStatus();
      setStatus(statusData);
    } catch (err) {
      setStatus({ ok: false, error: 'No disponible' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    loading,
    checkStatus
  };
};
