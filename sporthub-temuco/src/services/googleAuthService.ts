/**
 * Servicio de Google Authentication
 * Maneja el login con Google usando Google Identity Services
 */

import api from "@/config/backend";
// Next.js reemplaza process.env.* en build-time; declaramos process para evitar errores de tipos en cliente
declare const process: any;

interface GoogleCredentialResponse {
  credential: string; // ID Token JWT
  select_by?: string;
}

interface GoogleAuthResponse {
  ok: boolean;
  data?: {
    provider: string;
    profile: {
      sub: string;
      email: string;
      email_verified?: boolean;
      name?: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
    };
  };
  error?: string;
}

export const googleAuthService = {
  /**
   * Inicializa el botón de Google Sign-In
   * @param onSuccess - Callback cuando el login es exitoso
   * @param onError - Callback cuando hay un error
   */
  initializeGoogleSignIn(
    onSuccess: (response: any) => void,
    onError: (error: string) => void
  ) {
    // Verificar que google esté disponible
    if (typeof window === 'undefined' || !window.google) {
      console.error('Google Identity Services no está cargado');
      return;
    }

    // La variable de entorno se inyecta en tiempo de compilación por Next.js
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID no está configurado');
      onError('Configuración de Google Sign-In faltante');
      return;
    }

    // Inicializar Google Identity Services
    window.google.accounts.id.initialize({
      client_id: clientId,
      // Entregar el response crudo (contiene .credential). La verificación la haremos en loginWithGoogle
      callback: (response: GoogleCredentialResponse) => {
        onSuccess(response);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  },

  /**
   * Renderiza el botón de Google Sign-In
   * @param elementId - ID del elemento donde se renderizará el botón
   */
  renderButton(elementId: string) {
    if (typeof window === 'undefined' || !window.google) {
      console.error('Google Identity Services no está cargado');
      return;
    }

    window.google.accounts.id.renderButton(
      document.getElementById(elementId)!,
      {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%',
      }
    );
  },

  /**
   * Muestra el prompt de One Tap
   */
  showOneTap() {
    if (typeof window === 'undefined' || !window.google) {
      console.error('Google Identity Services no está cargado');
      return;
    }

    window.google.accounts.id.prompt();
  },

  /**
   * Verifica el ID token de Google con nuestro backend
   * @param idToken - Token recibido de Google
   */
  async verifyGoogleToken(idToken: string): Promise<GoogleAuthResponse> {
    try {
      const response = await api.post<GoogleAuthResponse>('/auth/google/idtoken', {
        id_token: idToken,
      });

      return response.data;
    } catch (error: any) {
      console.error('Error en backend al verificar token:', error);
      throw new Error(error.response?.data?.error || 'Error al autenticar con Google');
    }
  },

  /**
   * Procesa el login con Google (integración completa)
   * Maneja tanto la respuesta completa de FastAPI como el modo fallback
   */
  async loginWithGoogle(idToken: string) {
    const googleResponse = await this.verifyGoogleToken(idToken);
    
    console.log('🔍 [loginWithGoogle] googleResponse completo:', googleResponse);
    
    // La respuesta puede venir en dos formatos:
    // 1. {ok, data: {access_token, user}} - respuesta envuelta
    // 2. {access_token, user} - respuesta directa
    
    let responseData: any;
    
    if (googleResponse.ok && googleResponse.data) {
      // Formato envuelto
      responseData = googleResponse.data;
    } else if ((googleResponse as any).access_token) {
      // Formato directo
      responseData = googleResponse;
    } else {
      throw new Error('Error al verificar con Google');
    }
    
    console.log('🔍 [loginWithGoogle] responseData:', responseData);
    console.log('🔍 [loginWithGoogle] responseData.access_token existe?', !!responseData.access_token);
    console.log('🔍 [loginWithGoogle] responseData.user existe?', !!responseData.user);

    // Caso 1: Respuesta completa de FastAPI (access_token + user)
    if (responseData.access_token && responseData.user) {
      console.log('✅ Login completo con FastAPI - Token recibido');
      console.log('🔍 Guardando en localStorage...');
      console.log('  - access_token:', responseData.access_token.substring(0, 50) + '...');
      console.log('  - user:', responseData.user);
      
      // Guardar token y datos del usuario
      localStorage.setItem('auth_token', responseData.access_token);
      localStorage.setItem('refresh_token', responseData.refresh_token || '');
      localStorage.setItem('userData', JSON.stringify(responseData.user));
      localStorage.setItem('user_role', responseData.user.rol || 'usuario');
      
      console.log('✅ Datos guardados en localStorage');
      console.log('🔍 Verificando localStorage inmediatamente después:');
      console.log('  - auth_token:', localStorage.getItem('auth_token') ? 'EXISTS' : 'NULL');
      console.log('  - userData:', localStorage.getItem('userData') ? 'EXISTS' : 'NULL');
      console.log('  - user_role:', localStorage.getItem('user_role'));

      return {
        success: true,
        token: responseData.access_token,
        user: responseData.user,
        fallback: false
      };
    }

    // Caso 2: Modo fallback - Solo perfil de Google (FastAPI endpoint no disponible)
    if (responseData.profile || responseData.fallback) {
      const profile = responseData.profile;
      console.warn('⚠️ Modo fallback activo - Endpoint de FastAPI no disponible');
      console.log('✅ Perfil de Google verificado:', profile?.email);

      // Guardar datos temporalmente (hasta que FastAPI esté disponible)
      const userData = {
        email: profile.email,
        nombre: profile.given_name || profile.name?.split(' ')[0] || '',
        apellido: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
        rol: 'usuario' as const,
        avatar_url: profile.picture || null,
        google_id: profile.sub
      };

      localStorage.setItem('google_profile', JSON.stringify(profile));
      localStorage.setItem('user_role', 'usuario');
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Generar token temporal para desarrollo (NO usar en producción)
      const tempToken = `temp_google_${profile.sub}_${Date.now()}`;
      localStorage.setItem('auth_token', tempToken);

      return {
        success: true,
        token: tempToken,
        user: userData,
        fallback: true,
        message: responseData.message || 'Usando modo de desarrollo - FastAPI endpoint pendiente'
      };
    }

    throw new Error('Respuesta inesperada del servidor');
  },
};

// Tipos para window.google
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}
