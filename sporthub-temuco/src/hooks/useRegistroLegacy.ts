/**
 * Hook de Compatibilidad para useRegistro Legacy
 * ==============================================
 * 
 * Este hook mantiene la API anterior de useRegistro para componentes
 * que aún no han sido migrados al nuevo flujo de 2 pasos.
 * 
 * DEPRECADO: Este hook es temporal. Migrar a useRegistro nuevo cuando sea posible.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, type RegistroData } from '../services/authService';

interface UseRegistroLegacyState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  showVerificationMessage: boolean;
}

interface UseRegistroLegacyReturn {
  state: UseRegistroLegacyState;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  clearMessages: () => void;
}

/**
 * Hook de compatibilidad que mantiene la API anterior
 * @deprecated Usar useRegistro con flujo de 2 pasos en su lugar
 */
export const useRegistroLegacy = (): UseRegistroLegacyReturn => {
  const router = useRouter();
  const [state, setState] = useState<UseRegistroLegacyState>({
    isLoading: false,
    error: null,
    success: null,
    showVerificationMessage: false
  });

  /**
   * Maneja el envío del formulario (API legacy)
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
      
      // Usar el método legacy de registro
      const result = await authService.registrarUsuario(formData);
      
      if (result.ok) {
        // Mostrar mensaje de verificación de correo
        setState(prev => ({
          ...prev,
          isLoading: false,
          success: '¡Registro exitoso! Se ha enviado un correo de verificación.',
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