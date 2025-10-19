/**
 * Utilidad para manejar tokens JWT
 */

interface DecodedToken {
  exp: number;
  role: string;
  sub: string;
  // Agrega otros campos según tu JWT
}

export const tokenUtils = {
  // Obtener el token de localStorage
  getToken: (): string | null => {
    return localStorage.getItem('access_token') || localStorage.getItem('token');
  },

  // Decodificar el token JWT
  decodeToken: (token: string): DecodedToken | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  },

  // Verificar si el token ha expirado
  isTokenExpired: (token: string): boolean => {
    const decoded = tokenUtils.decodeToken(token);
    if (!decoded) return true;
    
    // exp está en segundos, Date.now() en milisegundos
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    
    // Consideramos el token expirado 1 minuto antes para evitar problemas de timing
    const bufferTime = 60 * 1000; // 1 minuto en milisegundos
    return expirationTime - bufferTime <= currentTime;
  },

  // Verificar si el token es válido y no ha expirado
  isTokenValid: (token?: string): boolean => {
    if (!token) {
      // 🔧 FIX: Manejar correctamente el tipo null
      const retrievedToken = tokenUtils.getToken();
      token = retrievedToken || undefined; // Convertir null a undefined
    }
    
    if (!token) {
      console.error('No se encontró token');
      return false;
    }

    if (tokenUtils.isTokenExpired(token)) {
      console.error('Token expirado');
      return false;
    }

    return true;
  },

  // Obtener el rol del token
  getRoleFromToken: (token: string): string | null => {
    const decoded = tokenUtils.decodeToken(token);
    return decoded?.role || null;
  },

  // Limpiar el token y redirigir a login
  clearTokenAndRedirect: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    window.location.href = '/login';
  }
}