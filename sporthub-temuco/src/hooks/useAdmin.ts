/**
 * Custom Hook para Admin/Owner - Next.js + Docker
 * Simplificado siguiendo el patrón de useRegistro
 */

'use client';

import { useState } from 'react';
import { adminService } from '../services/adminService';
import type {
  Complejo,
  Cancha,
  ReservaOwner,
  EstadisticasOwner,
  CreateComplejoInput,
  UpdateComplejoInput,
  CreateCanchaInput,
  UpdateCanchaInput
} from '../types/admin';

interface UseAdminState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  data: {
    complejos: Complejo[];
    canchas: Cancha[];
    reservas: ReservaOwner[];
    estadisticas: EstadisticasOwner | null;
  };
}

interface UseAdminReturn {
  state: UseAdminState;
  loadDashboard: () => Promise<void>;
  loadMisRecursos: () => Promise<void>;
  loadMisReservas: () => Promise<void>;
  createComplejo: (data: CreateComplejoInput) => Promise<boolean>;
  updateComplejo: (id: number, data: UpdateComplejoInput) => Promise<boolean>;
  deleteComplejo: (id: number) => Promise<boolean>;
  createCancha: (data: CreateCanchaInput) => Promise<boolean>;
  updateCancha: (id: number, data: UpdateCanchaInput) => Promise<boolean>;
  deleteCancha: (id: number) => Promise<boolean>;
  clearMessages: () => void;
}

export const useAdmin = (): UseAdminReturn => {
  const [state, setState] = useState<UseAdminState>({
    isLoading: false,
    error: null,
    success: null,
    data: {
      complejos: [],
      canchas: [],
      reservas: [],
      estadisticas: null,
    }
  });

  const clearMessages = () => {
    setState(prev => ({ ...prev, error: null, success: null }));
  };

  const loadDashboard = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const dashboardData = await adminService.getDashboardData();
      // Complementar con listado completo de canchas (para contar y mostrar)
      try {
        // Obtener canchas con page_size grande para dashboard y conteos precisos
        const allCanchas = await adminService.getMisCanchas(100);
        dashboardData.canchas = allCanchas || dashboardData.canchas || [];
      } catch (err) {
        // No bloquear la carga del dashboard si getMisCanchas falla
        console.warn('No se pudo obtener listado completo de canchas para el dashboard', err);
      }
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          complejos: dashboardData.complejos || [],
          canchas: dashboardData.canchas || [],
          estadisticas: dashboardData.estadisticas || null,
        },
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
    }
  };

  const loadMisRecursos = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const recursos = await adminService.getMisRecursos();
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          complejos: recursos.complejos || [],
          canchas: recursos.canchas || [],
        },
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
    }
  };

  const loadMisReservas = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const reservas = await adminService.getMisReservas(undefined, 100);

      // Enriquecer reservas con nombre de cancha si falta, usando canchas ya cargadas en el estado
      // Soportar both legacy snake_case and nuevo camelCase shapes from FastAPI
      const enriched = reservas.map((r: any) => {
        // Normalize possible camelCase ids into snake_case for consistency
        if (!r.usuario_id && (r as any).usuarioId) r.usuario_id = (r as any).usuarioId;
        if (!r.cancha_id && (r as any).canchaId) r.cancha_id = (r as any).canchaId;
        // Si la API ya devuelve canchaNombre (nuevo formato), usarlo antes de fallback
        if ((r as any).canchaNombre) {
          r.cancha_nombre = (r as any).canchaNombre;
          r.cancha_id = r.cancha_id || (r as any).canchaId;
        }

        if (!r.cancha_nombre) {
          const cancha = state.data.canchas.find((c: any) => c.id === r.cancha_id || c.id === (r as any).canchaId);
          if (cancha) r.cancha_nombre = cancha.nombre || cancha.name || cancha.nombre_corto;
        }
        // El enriquecimiento de nombres de canchas se realiza en el bloque inferior (con adminService.getMisCanchas(100))
        // Si la API devuelve objeto anidado de cancha (como en /reservas), usar su nombre
        if (!r.cancha_nombre && (r as any).cancha) {
          const c = (r as any).cancha;
          r.cancha_nombre = c?.nombre || c?.name || `Cancha #${c?.id || c?.canchaId}`;
          r.cancha_id = r.cancha_id || c?.id || c?.canchaId;
        }
        // Si la API devuelve objeto anidado de cancha (como en /reservas), usar su nombre
        if (!r.cancha_nombre && (r as any).cancha) {
          const c = (r as any).cancha;
          r.cancha_nombre = c?.nombre || c?.name || `Cancha #${c?.id || c?.canchaId}`;
          r.cancha_id = r.cancha_id || c?.id || c?.canchaId;
        }
        // Si la API ya devuelve usuarioNombre (nuevo formato), usarlo antes de fallback
        if ((r as any).usuarioNombre) {
          r.usuario_nombre = (r as any).usuarioNombre;
          r.usuario_id = r.usuario_id || (r as any).usuarioId;
        }

        if (!r.usuario_nombre) {
          r.usuario_nombre = r.usuario_id ? `Usuario #${r.usuario_id}` : 'Usuario desconocido';
        }
        // Si la API devuelve objeto anidado de usuario, usar nombre
        if ((!r.usuario_nombre || r.usuario_nombre.startsWith('Usuario #')) && (r as any).usuario) {
           const u = (r as any).usuario;
          r.usuario_nombre = u?.nombre || u?.full_name || u?.email || r.usuario_nombre;
          r.usuario_id = r.usuario_id || u?.id || u?.usuarioId;
        }
        // Si la API devuelve objeto anidado de usuario, usar nombre
        if ((!r.usuario_nombre || r.usuario_nombre.startsWith('Usuario #')) && (r as any).usuario) {
           const u = (r as any).usuario;
          r.usuario_nombre = u?.nombre || u?.full_name || u?.email || r.usuario_nombre;
          r.usuario_id = r.usuario_id || u?.id || u?.usuarioId;
        }
        return r;
      });

      // Normalize precio_total for FastAPI camelCase or snake_case
      enriched.forEach((r: any) => {
        if (typeof r.precio_total === 'undefined' && typeof (r as any).precioTotal !== 'undefined') {
          r.precio_total = (r as any).precioTotal;
        }
      });

      // Buscar usuarios faltantes por ID en bloque (si hacen falta nombres reales)
      try {
        const usuariosService = (await import('../services/usuariosService')).usuariosService;
        // Consider camelCase or snake_case user IDs
        const missingUserIds = Array.from(new Set(enriched.filter((r: any) => !r.usuario_nombre || r.usuario_nombre.startsWith('Usuario #')).map((r: any) => r.usuario_id || (r as any).usuarioId))).slice(0, 20);
        if (missingUserIds.length > 0) {
          // Buscar cada usuario y mapear nombres
          await Promise.all(missingUserIds.map(async (uid: number) => {
            try {
              const u = await usuariosService.obtenerPublico(uid);
              enriched.forEach((r: any) => { if ((r.usuario_id || (r as any).usuarioId) === uid) { r.usuario_nombre = u?.nombre || u?.full_name || r.usuario_nombre; r.usuario_email = r.usuario_email || u?.email; r.usuario_id = r.usuario_id || (r as any).usuarioId; } });
            } catch (err) {
              // No bloquear si falla
              console.warn('⚠️ No se pudo obtener usuario', uid, err);
            }
          }));
        }
      } catch (err) {
        console.warn('⚠️ No se pudo enriquecer nombres de usuarios de reservas:', err);
      }

      // Rellenar nombres de canchas faltantes con la lista completa si es necesario
      try {
        const neededCanchaIds = Array.from(new Set(enriched.filter((r:any) => !r.cancha_nombre).map((r:any) => r.cancha_id || (r as any).canchaId))).slice(0, 50);
        if (neededCanchaIds.length > 0) {
          // Asegurarse de tener la lista completa de canchas en estado
          let allCanchas = state.data.canchas || [];
          if (!allCanchas || allCanchas.length === 0) {
            allCanchas = await adminService.getMisCanchas(100);
          }
          enriched.forEach((r: any) => {
            if (!r.cancha_nombre) {
              const canchaId = r.cancha_id || (r as any).canchaId;
              const cancha = allCanchas.find((c: any) => c.id === canchaId);
              if (cancha) r.cancha_nombre = cancha?.nombre || cancha?.name || `Cancha #${canchaId}`;
            }
          });
          // Si una reserva trae objeto cancha, normalizar tipo y nombre
          enriched.forEach((r: any) => {
            const c = (r as any).cancha;
            if (c) {
              r.cancha_nombre = r.cancha_nombre || c.nombre || c.name || (r as any).canchaNombre;
              r.cancha_id = r.cancha_id || c.id || c.canchaId || (r as any).canchaId;
              r.cancha_tipo = r.cancha_tipo || c.tipo;
            }
          });
        }
      } catch (err) {
        console.warn('⚠️ No se pudo enriquecer nombres de canchas de reservas:', err);
      }

      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          reservas: enriched || []
        },
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  };

  const createComplejo = async (data: CreateComplejoInput): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const nuevoComplejo = await adminService.createComplejo(data);
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          complejos: [...prev.data.complejos, nuevoComplejo]
        },
        success: 'Complejo creado exitosamente',
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
      return false;
    }
  };

  const updateComplejo = async (id: number, data: UpdateComplejoInput): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const complejoActualizado = await adminService.updateComplejo(id, data);
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          complejos: prev.data.complejos.map(c => c.id === id ? complejoActualizado : c)
        },
        success: 'Complejo actualizado exitosamente',
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
      return false;
    }
  };

  const deleteComplejo = async (id: number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await adminService.deleteComplejo(id);
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          complejos: prev.data.complejos.filter(c => c.id !== id)
        },
        success: 'Complejo eliminado exitosamente',
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
      return false;
    }
  };

  const createCancha = async (data: CreateCanchaInput): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const nuevaCancha = await adminService.createCancha(data);
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          canchas: [...prev.data.canchas, nuevaCancha]
        },
        success: 'Cancha creada exitosamente',
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
      return false;
    }
  };

  const updateCancha = async (id: number, data: UpdateCanchaInput): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const canchaActualizada = await adminService.updateCancha(id, data);
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          canchas: prev.data.canchas.map(c => c.id === id ? canchaActualizada : c)
        },
        success: 'Cancha actualizada exitosamente',
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
      return false;
    }
  };

  const deleteCancha = async (id: number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await adminService.deleteCancha(id);
      
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          canchas: prev.data.canchas.filter(c => c.id !== id)
        },
        success: 'Cancha eliminada exitosamente',
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
      return false;
    }
  };

  return {
    state,
    loadDashboard,
    loadMisRecursos,
    loadMisReservas,
    createComplejo,
    updateComplejo,
    deleteComplejo,
    createCancha,
    updateCancha,
    deleteCancha,
    clearMessages,
  };
};

// Hooks específicos para casos de uso particulares
export const useAdminDashboard = () => {
  const admin = useAdmin();
  
  return {
    isLoading: admin.state.isLoading,
    error: admin.state.error,
    success: admin.state.success,
    complejos: admin.state.data.complejos,
    canchas: admin.state.data.canchas,
    estadisticas: admin.state.data.estadisticas,
    reservas: admin.state.data.reservas,
    loadDashboard: admin.loadDashboard,
    loadMisReservas: admin.loadMisReservas,
    clearMessages: admin.clearMessages,
  };
};

export const useComplejos = () => {
  const admin = useAdmin();
  
  return {
    isLoading: admin.state.isLoading,
    error: admin.state.error,
    success: admin.state.success,
    complejos: admin.state.data.complejos,
    createComplejo: admin.createComplejo,
    updateComplejo: admin.updateComplejo,
    deleteComplejo: admin.deleteComplejo,
    loadMisRecursos: admin.loadMisRecursos,
    clearMessages: admin.clearMessages,
  };
};

export const useCanchas = () => {
  const admin = useAdmin();
  
  return {
    isLoading: admin.state.isLoading,
    error: admin.state.error,
    success: admin.state.success,
    canchas: admin.state.data.canchas,
    createCancha: admin.createCancha,
    updateCancha: admin.updateCancha,
    deleteCancha: admin.deleteCancha,
    loadMisRecursos: admin.loadMisRecursos,
    clearMessages: admin.clearMessages,
  };
};