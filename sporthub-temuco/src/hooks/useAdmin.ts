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
    loadDashboard: admin.loadDashboard,
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