/**
 * Custom Hook para Registro - Arquitectura Limpia
 * Maneja el estado del formulario y coordina con el servicio de autenticación
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, type RegistroData } from '../services/authService';

interface UseRegistroState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  showVerificationMessage: boolean; // Nuevo estado
}

interface UseRegistroReturn {
  state: UseRegistroState;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  clearMessages: () => void;
}

export const useRegistro = (): UseRegistroReturn => {
  const router = useRouter();
  const [state, setState] = useState<UseRegistroState>({
    isLoading: false,
    error: null,
    success: null,
    showVerificationMessage: false
  });

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Limpiar mensajes anteriores
    setState(prev => ({ ...prev, error: null, success: null, showVerificationMessage: false }));
    
    // Establecer estado de carga
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Extraer datos del formulario
      const formData = authService.extractFormData(e.currentTarget);
      
      // Registrar usuario usando el servicio
      const result = await authService.registrarUsuario(formData);
      
      if (result.ok) {
        // Mostrar mensaje de verificación de correo
        setState(prev => ({
          ...prev,
          isLoading: false,
          success: '¡Registro exitoso!',
          showVerificationMessage: true
        }));
        
        // NO redirigir automáticamente, mostrar mensaje de verificación
        
      } else {
        // Mostrar error
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Error al registrar usuario'
        }));
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error inesperado. Por favor, inténtalo nuevamente.'
      }));
    }
  };

  /**
   * Limpia los mensajes de error y éxito
   */
  const clearMessages = () => {
    setState(prev => ({ ...prev, error: null, success: null, showVerificationMessage: false }));
  };

  return {
    state,
    handleSubmit,
    clearMessages
  };
};