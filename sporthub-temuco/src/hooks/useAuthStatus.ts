'use client';
import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface MeResponse {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: string;
  email_verificado: boolean;
  created_at: string;
  updated_at: string;
}

export function useAuthStatus() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      // 🔥 DEBUGGING: Verificar tokens en localStorage
      const token = authService.getToken();
      const isAuth = authService.isAuthenticated();
      
      console.log('=== AUTH STATUS CHECK ===');
      console.log('Token en localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('isAuthenticated():', isAuth);
      
      if (!isAuth || !token) {
        console.log('❌ No hay token válido, usuario no autenticado');
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log('✅ Token encontrado, obteniendo datos del usuario...');
      
      // 🔥 PEQUEÑO DELAY para asegurar que el interceptor tenga el token
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const userData = await authService.me();
      console.log('✅ Datos del usuario obtenidos:', userData);
      setUser(userData);
      
    } catch (error: any) {
      console.error('❌ Error verificando autenticación:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // 🔥 Si el error es de autenticación (401), limpiar sesión
      if (error.response?.status === 401) {
        console.log('🔄 Token inválido/expirado, limpiando sesión...');
        authService.clearSession();
        setUser(null);
      } else {
        // 🔥 Para otros errores, no limpiar la sesión automáticamente
        console.log('⚠️ Error de red o servidor, manteniendo sesión...');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getUserButtonProps = () => {
    if (isLoading) {
      return {
        text: "Cargando...",
        href: "#",
        disabled: true
      };
    }
    
    if (user) {
      return {
        text: user.nombre || 'Usuario',
        href: "/usuario/EditarPerfil",
        disabled: false
      };
    }
    
    return {
      text: "Iniciar Sesión",
      href: "/login",
      disabled: false
    };
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    buttonProps: getUserButtonProps(),
    refreshAuth: checkAuthStatus
  };
}