/**
 * Custom Hook para Verificación de Registro
 * =========================================
 * 
 * Hook complementario especializado para el paso de verificación de OTP.
 * Se usa cuando el usuario ya completó el primer paso del registro y
 * necesita verificar su email con el código de 6 dígitos.
 * 
 * Casos de uso:
 * - Componente dedicado de verificación de OTP
 * - Flujo separado de verificación
 * - Reenvío de códigos
 * - Validación específica de códigos
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  authService, 
  type VerificationData,
  type RegistroResponse
} from '../services/authService';

interface UseRegistroVerificacionState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  isCompleted: boolean;
  resendCount: number;
  lastResendTime: number | null;
}

interface UseRegistroVerificacionProps {
  email: string;
  actionToken: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseRegistroVerificacionReturn {
  // Estado
  state: UseRegistroVerificacionState;
  
  // Acciones
  verifyCode: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  clearMessages: () => void;
  
  // Utilidades
  canResend: boolean;
  timeUntilResend: number;
}

/**
 * Hook para manejar la verificación de OTP en el registro
 */
export const useRegistroVerificacion = ({
  email,
  actionToken,
  onSuccess,
  onError
}: UseRegistroVerificacionProps): UseRegistroVerificacionReturn => {
  const router = useRouter();
  
  const [state, setState] = useState<UseRegistroVerificacionState>({
    isLoading: false,
    error: null,
    success: null,
    isCompleted: false,
    resendCount: 0,
    lastResendTime: null
  });

  // Constantes para el reenvío
  const RESEND_COOLDOWN = 60000; // 60 segundos
  const MAX_RESENDS = 3;

  /**
   * Verificar código OTP
   */
  const verifyCode = async (code: string) => {
    // Validar entrada
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      setState(prev => ({
        ...prev,
        error: 'El código debe tener exactamente 6 dígitos'
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
        email,
        code: code.trim(),
        action_token: actionToken
      };

      const result: RegistroResponse = await authService.verificarOTPyCompletarRegistro(verificationData);

      if (result.ok && result.data) {
        // Verificación exitosa
        setState(prev => ({
          ...prev,
          isLoading: false,
          isCompleted: true,
          success: '¡Verificación exitosa! Bienvenido a SportHub.'
        }));

        // Llamar callback de éxito si existe
        onSuccess?.();

        // Redirigir después de un breve delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } else {
        // Error en verificación
        const errorMessage = result.error || 'Código de verificación inválido';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));

        // Llamar callback de error si existe
        onError?.(errorMessage);
      }
    } catch (error) {
      console.error('Error inesperado en verificación:', error);
      const errorMessage = 'Error al verificar el código. Inténtalo nuevamente.';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      onError?.(errorMessage);
    }
  };

  /**
   * Reenviar código OTP
   */
  const resendCode = async () => {
    // Verificar si puede reenviar
    if (!canResend) {
      setState(prev => ({
        ...prev,
        error: `Espera ${Math.ceil(timeUntilResend / 1000)} segundos antes de reenviar`
      }));
      return;
    }

    // Verificar límite de reenvíos
    if (state.resendCount >= MAX_RESENDS) {
      setState(prev => ({
        ...prev,
        error: 'Has alcanzado el límite de reenvíos. Inicia el registro nuevamente.'
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
      // TODO: Implementar endpoint específico de resend cuando esté disponible
      // Por ahora simulamos el comportamiento
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        success: 'Código reenviado a tu email.',
        resendCount: prev.resendCount + 1,
        lastResendTime: Date.now()
      }));

    } catch (error) {
      console.error('Error al reenviar código:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al reenviar el código. Inténtalo más tarde.'
      }));
    }
  };

  /**
   * Limpiar mensajes
   */
  const clearMessages = () => {
    setState(prev => ({ 
      ...prev, 
      error: null, 
      success: null 
    }));
  };

  // Calcular si puede reenviar
  const canResend = !state.lastResendTime || 
    (Date.now() - state.lastResendTime) >= RESEND_COOLDOWN;

  // Calcular tiempo restante para reenvío
  const timeUntilResend = state.lastResendTime ? 
    Math.max(0, RESEND_COOLDOWN - (Date.now() - state.lastResendTime)) : 0;

  return {
    state,
    verifyCode,
    resendCode,
    clearMessages,
    canResend,
    timeUntilResend
  };
};

/**
 * Hook simplificado para componentes que solo necesitan verificar
 * sin todas las funcionalidades avanzadas
 */
export const useSimpleVerification = (
  email: string, 
  actionToken: string
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const verify = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const verificationData: VerificationData = {
        email,
        code: code.trim(),
        action_token: actionToken
      };

      const result = await authService.verificarOTPyCompletarRegistro(verificationData);
      setIsLoading(false);
      
      if (result.ok) {
        return true;
      } else {
        setError(result.error || 'Código inválido');
        return false;
      }
    } catch (error) {
      setIsLoading(false);
      setError('Error de conexión');
      return false;
    }
  };

  return { verify, isLoading, error };
};