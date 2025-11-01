/**
 * Servicio de Google Authentication
 * Maneja el login con Google usando Google Identity Services
 */

import api from "@/config/backend";

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
    const clientId = '648604313333-vhr12pkceshfpi6itu5htq75hsvtrrlf.apps.googleusercontent.com';
    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID no está configurado');
      onError('Configuración de Google Sign-In faltante');
      return;
    }

    // Inicializar Google Identity Services
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: GoogleCredentialResponse) => {
        try {
          // Enviar el ID token al backend para verificación
          const result = await this.verifyGoogleToken(response.credential);
          onSuccess(result);
        } catch (error: any) {
          console.error('Error verificando token de Google:', error);
          onError(error.message || 'Error al verificar con Google');
        }
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
   * TODO: Conectar con el flujo de login/register de tu backend FastAPI
   * Por ahora retorna el perfil verificado
   */
  async loginWithGoogle(idToken: string) {
    const googleResponse = await this.verifyGoogleToken(idToken);
    
    if (!googleResponse.ok || !googleResponse.data) {
      throw new Error('Error al verificar con Google');
    }

    const { profile } = googleResponse.data;

    // TODO: Aquí debes crear/buscar el usuario en tu backend FastAPI
    // y obtener un access_token válido para tu sistema
    // Por ahora, solo retornamos el perfil verificado
    
    console.log('✅ Perfil de Google verificado:', profile);

    // Guardar datos temporalmente (hasta que conectemos con FastAPI)
    localStorage.setItem('google_profile', JSON.stringify(profile));
    localStorage.setItem('user_role', 'usuario'); // Rol por defecto
    localStorage.setItem('userData', JSON.stringify({
      email: profile.email,
      nombre: profile.given_name || profile.name?.split(' ')[0] || '',
      apellido: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
      rol: 'usuario'
    }));

    return {
      profile,
      token: null, // TODO: Obtener token real del backend
      usuario: {
        email: profile.email,
        nombre: profile.given_name || profile.name?.split(' ')[0] || '',
        apellido: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
        rol: 'usuario' as const
      }
    };
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
