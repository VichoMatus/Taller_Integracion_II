/**
 * CONFIGURACIÓN DE AXIOS PARA EL FRONTEND
 * ======================================
 * 
 * Configuración centralizada para todas las llamadas al Backend-for-Frontend (BFF)
 * Next.js maneja automáticamente las variables de entorno, no necesitamos dotenv
 */

import axios from 'axios';

// Configuración centralizada de URLs
// HARDCODEADA TEMPORALMENTE PARA RESOLVER CACHÉ
const getBackendUrl = () => {
  console.log('🔧 [getBackendUrl] Iniciando detección de backend...');
  
  // Prioridad 1: Variable de entorno explícita
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    console.log('🎯 [getBackendUrl] Usando variable de entorno NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  
  // 🚨 HARDCODE TEMPORAL: Para resolver problemas de caché en producción
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('🌐 Cliente hostname:', hostname);
    
    // Solo localhost usa localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('💻 [getBackendUrl] LOCAL confirmado → localhost:4000');
      return 'http://localhost:4000';
    }
    
    // Autodetección por hostname del frontend
    // Si el frontend contiene develop/staging/test → backend develop
    if (hostname.includes('develop') || hostname.includes('staging') || hostname.includes('test')) {
      return 'http://backend-develop-0kbdnu-ec3ee3-168-232-167-73.traefik.me';
    }
    
    // Por defecto: backend main (producción)
    return 'http://backend-mn66n6-82bd05-168-232-167-73.traefik.me';
  }
  
  // En servidor, usar producción por defecto
  console.log('🖥️ [getBackendUrl] SERVIDOR → PRODUCCIÓN');
  return 'https://backend-mn66n6-82bd05-168-232-167-73.traefik.me';

};

// URLs simples y directas
const BACKEND_BASE_URL = getBackendUrl();
export const BACKEND_URL = BACKEND_BASE_URL;
export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

console.log('🔧 [backend.ts] Configuración final cargada:');
console.log('  - BACKEND_BASE_URL:', BACKEND_BASE_URL);
console.log('  - API_BASE_URL:', API_BASE_URL);
console.log('  - Entorno (CLIENT):', typeof window !== 'undefined' ? 'Cliente' : 'Servidor');
console.log('  - NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'No definida');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - Timestamp:', new Date().toISOString());
if (typeof window !== 'undefined') {
  console.log('  - Window hostname:', window.location.hostname);
  console.log('  - Window href:', window.location.href);
}

// Instancia de axios apuntando al Backend for Frontend (BFF)
export const apiBackend = axios.create({
  baseURL: API_BASE_URL, // Usar la URL calculada directamente
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

// Interceptor para agregar token automáticamente
apiBackend.interceptors.request.use(
  (config) => {
    // Configurar baseURL dinámicamente
    if (!config.baseURL) {
      config.baseURL = API_BASE_URL;
    }
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas del BFF
apiBackend.interceptors.response.use(
  (response) => {
    // Para el endpoint de reservas, dejar pasar la respuesta sin procesar
    if (response.config.url?.includes('/reservas') || response.config.url?.includes('/password')) {
      return response;
    }
    
    // Si el BFF retorna { ok: true, data: ... }, extraer los datos
    if (response.data && typeof response.data === 'object' && 'ok' in response.data) {
      if (response.data.ok === false) {
        throw new Error(response.data.error || response.data.message || 'Error del servidor');
      }
      return {
        ...response,
        data: response.data.data || response.data
      };
    }
    
    return response;
  },
  (error) => {
    // Logging detallado del error
    console.error('❌ [apiBackend] Error interceptor:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      responseDataType: typeof error.response?.data,
      fullError: error
    });

    // NO limpiar localStorage aquí - eso lo maneja useAdminProtection
    // Solo loguear el error para debugging
    if (error.response?.status === 401) {
      console.warn('⚠️ [apiBackend] Error 401 - No autenticado');
    }
    
    // Extraer mensaje de error del BFF
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Intentar obtener el mensaje de error de varias formas
      let errorMessage = 'Error del servidor';
      
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (typeof errorData === 'object') {
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (typeof errorData.msg === 'string') {
          errorMessage = errorData.msg;
        } else if (errorData.error && typeof errorData.error === 'object') {
          // Si error es un objeto, intentar extraer el mensaje
          if (errorData.error.message) {
            errorMessage = errorData.error.message;
          } else {
            errorMessage = JSON.stringify(errorData.error);
          }
        } else {
          // Si no encontramos un mensaje específico, mostrar el objeto completo
          errorMessage = JSON.stringify(errorData);
        }
      }
      
      console.error('❌ [apiBackend] Mensaje de error extraído:', errorMessage);
      
      // Para errores 401, no lanzar error visible al usuario
      if (error.response?.status === 401) {
        const authError = new Error(errorMessage);
        authError.name = 'AuthenticationError';
        return Promise.reject(authError);
      }
      
      // Crear un nuevo error con el mensaje extraído
      const customError = new Error(errorMessage);
      (customError as any).response = error.response;
      (customError as any).statusCode = error.response?.status;
      (customError as any).originalError = error;
      
      console.error('❌ [apiBackend] Custom error creado:', customError.message);
      return Promise.reject(customError);
    }
    
    console.error('❌ [apiBackend] Error sin response.data, rechazando error original');
    return Promise.reject(error);
  }
);

export default apiBackend;
