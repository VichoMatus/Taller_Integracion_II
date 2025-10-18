/**
 * Custom Hook para Registro - Flujo de 2 Pasos
 * =============================================
 * 
 * Este hook maneja el nuevo sistema de registro de 2 pasos:
 * 1. Captura datos del usuario y envía OTP por email
 * 2. Verifica el código OTP y completa el registro
 * 
 * Arquitectura:
 * - Estado unificado para ambos pasos
 * - Validación de datos antes del envío
 * - Gestión de errores detallada
 * - Flujo UX optimizado
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  authService, 
  type RegistroData, 
  type RegistroInitResponse, 
  type VerificationData,
  type RegistroResponse
} from '../services/authService';

/**
 * Estados posibles del proceso de registro
 */
type RegistroStep = 'form' | 'verification' | 'completed';

interface UseRegistroState {
  // Estado general
  isLoading: boolean;
  error: string | null;
  success: string | null;
  
  // Control de flujo
  currentStep: RegistroStep;
  
  // Datos del proceso
  email: string | null;
  actionToken: string | null;
  
  // UI específica
  showVerificationForm: boolean;
  showSuccessMessage: boolean;
}

interface UseRegistroReturn {
  // Estado
  state: UseRegistroState;
  
  // Acciones principales
  handleSubmitRegistro: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleSubmitVerification: (data: { code: string }) => Promise<void>;
  
  // Utilidades
  clearMessages: () => void;
  resetFlow: () => void;
  resendOTP: () => Promise<void>;
}

export const useRegistro = (): UseRegistroReturn => {
  const router = useRouter();
  
  const [state, setState] = useState<UseRegistroState>({
    isLoading: false,
    error: null,
    success: null,
    currentStep: 'form',
    email: null,
    actionToken: null,
    showVerificationForm: false,
    showSuccessMessage: false
  });

  /**
   * PASO 1: Manejar envío del formulario de registro
   * Captura datos del usuario y solicita OTP
   */
  const handleSubmitRegistro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Limpiar estado anterior
    setState(prev => ({ 
      ...prev, 
      error: null, 
      success: null, 
      isLoading: true 
    }));

    try {
      // Extraer y validar datos del formulario
      const formData = authService.extractFormData(e.currentTarget);
      
      // Enviar datos y solicitar OTP
      const result: RegistroInitResponse = await authService.registrarUsuarioConOTP(formData);
      
      if (result.ok && result.data) {
        // Éxito: mostrar formulario de verificación
        setState(prev => ({
          ...prev,
          isLoading: false,
          currentStep: 'verification',
          email: result.data!.email,
          actionToken: result.data!.action_token,
          showVerificationForm: true,
          success: 'Código de verificación enviado a tu email. Revisa tu bandeja de entrada.'
        }));
      } else {
        // Error en el registro
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Error al enviar el código de verificación'
        }));
      }
    } catch (error) {
      console.error('Error inesperado en registro:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error inesperado. Por favor, inténtalo nuevamente.'
      }));
    }
  };

  /**
   * PASO 2: Manejar verificación del código OTP
   * Valida el código y completa el registro
   */
  const handleSubmitVerification = async (data: { code: string }) => {
    if (!state.email || !state.actionToken) {
      setState(prev => ({ 
        ...prev, 
        error: 'Faltan datos para completar la verificación. Reinicia el proceso.' 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      error: null, 
      success: null, 
      isLoading: true 
    }));

    try {
      const verificationData: VerificationData = {
        email: state.email,
        code: data.code.trim(),
        action_token: state.actionToken
      };

      const result: RegistroResponse = await authService.verificarOTPyCompletarRegistro(verificationData);

      if (result.ok && result.data) {
        // Registro completado exitosamente
        setState(prev => ({
          ...prev,
          isLoading: false,
          currentStep: 'completed',
          showVerificationForm: false,
          showSuccessMessage: true,
          success: '¡Registro completado exitosamente! Bienvenido a SportHub.'
        }));

        // Redirigir después de un breve delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } else {
        // Error en la verificación
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Código de verificación inválido'
        }));
      }
    } catch (error) {
      console.error('Error inesperado en verificación:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al verificar el código. Inténtalo nuevamente.'
      }));
    }
  };

  /**
   * Reenviar código OTP
   */
  const resendOTP = async () => {
    if (!state.email) return;

    setState(prev => ({ 
      ...prev, 
      error: null, 
      success: null, 
      isLoading: true 
    }));

    try {
      // Reenviar usando el endpoint de resend (si está disponible)
      // Por ahora, simular el comportamiento exitoso
      setState(prev => ({
        ...prev,
        isLoading: false,
        success: 'Código reenviado a tu email.'
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al reenviar el código.'
      }));
    }
  };

  /**
   * Limpiar mensajes de error y éxito
   */
  const clearMessages = () => {
    setState(prev => ({ 
      ...prev, 
      error: null, 
      success: null 
    }));
  };

  /**
   * Reiniciar el flujo completo
   */
  const resetFlow = () => {
    setState({
      isLoading: false,
      error: null,
      success: null,
      currentStep: 'form',
      email: null,
      actionToken: null,
      showVerificationForm: false,
      showSuccessMessage: false
    });
  };

  return {
    state,
    handleSubmitRegistro,
    handleSubmitVerification,
    clearMessages,
    resetFlow,
    resendOTP
  };
};