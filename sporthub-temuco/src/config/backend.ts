/**
 * CONFIGURACIÓN DE AXIOS PARA EL FRONTEND
 * ======================================
 * 
 * Configuración centralizada para todas las llamadas al Backend-for-Frontend (BFF)
 * Next.js maneja automáticamente las variables de entorno, no necesitamos dotenv
 */

import axios from 'axios';

// Configuración centralizada de URLs
// Detecta automáticamente el entorno
const getBackendUrl = () => {
  console.log('🔧 [getBackendUrl] Iniciando detección de backend...');
  
  // Prioridad 1: Variable de entorno explícita
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    console.log('🎯 [getBackendUrl] Usando variable de entorno NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  
  // Prioridad 2: En cliente, detecta por hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const fullUrl = window.location.href;
    
    console.log('🌐 [getBackendUrl] Detectando desde cliente:');
    console.log('  - Hostname:', hostname);
    console.log('  - Full URL:', fullUrl);
    
    // Desarrollo local VERDADERO (solo si realmente estamos en localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('💻 [getBackendUrl] Entorno LOCAL detectado → localhost:4000');
      return 'http://localhost:4000';
    }
    
    // Si estamos en cualquier dominio con traefik.me → estamos en producción/staging
    if (hostname.includes('traefik.me')) {
      console.log('☁️ [getBackendUrl] Dominio traefik.me detectado, analizando subdominios...');
      
      // Si el frontend contiene develop/staging/test → backend develop
      if (hostname.includes('develop') || hostname.includes('staging') || hostname.includes('test')) {
        const backendUrl = 'https://backend-develop-0kbdnu-ec3ee3-168-232-167-73.traefik.me';
        console.log('🚧 [getBackendUrl] Entorno DEVELOP detectado → ', backendUrl);
        return backendUrl;
      } else {
        // Por defecto: backend main (producción)
        const backendUrl = 'https://backend-mn66n6-82bd05-168-232-167-73.traefik.me';
        console.log('🏭 [getBackendUrl] Entorno PRODUCCIÓN detectado → ', backendUrl);
        return backendUrl;
      }
    }
    
    // Si estamos en cualquier otro dominio remoto → asumir producción
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const backendUrl = 'https://backend-mn66n6-82bd05-168-232-167-73.traefik.me';
      console.log('🌍 [getBackendUrl] Dominio externo detectado, usando PRODUCCIÓN → ', backendUrl);
      return backendUrl;
    }
    
    // Fallback: local
    console.log('❓ [getBackendUrl] No se pudo determinar entorno, usando localhost');
    return 'http://localhost:4000';
  }
  
  // Prioridad 3: En servidor, localhost por defecto
  console.log('🖥️ [getBackendUrl] Entorno SERVIDOR (SSR) → localhost:4000');
  return 'http://localhost:4000';
};

const BACKEND_BASE_URL = getBackendUrl();

export const BACKEND_URL = BACKEND_BASE_URL; // Para uso directo
export const API_BASE_URL = `${BACKEND_BASE_URL}/api`; // Para API calls

console.log('🔧 [backend.ts] Configuración final cargada:');
console.log('  - BACKEND_BASE_URL:', BACKEND_BASE_URL);
console.log('  - API_BASE_URL:', API_BASE_URL);
console.log('  - Entorno (CLIENT):', typeof window !== 'undefined' ? 'Cliente' : 'Servidor');
console.log('  - NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'No definida');

// Instancia de axios apuntando al Backend for Frontend (BFF)
export const apiBackend = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuración para manejar certificados SSL en desarrollo/staging
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Permite códigos de error para mejor debugging
  }
});

// Interceptor para agregar token automáticamente
apiBackend.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      // Log para debugging
      console.log('🔐 [apiBackend] Interceptor request:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
      });
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('⚠️ [apiBackend] No se encontró token en localStorage para:', config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas del BFF
apiBackend.interceptors.response.use(
  (response) => {
    // Log para debugging de respuestas
    console.log('📥 [apiBackend] Response:', {
      url: response.config.url,
      status: response.status,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      hasOkProperty: response.data && typeof response.data === 'object' && 'ok' in response.data
    });

    // Para el endpoint de reservas, dejar pasar la respuesta sin procesar
    // La API devuelve directamente un array, no un objeto con { ok, data }
    if (response.config.url?.includes('/reservas')) {
      console.log('[apiBackend] Respuesta de reservas (sin procesar):', response.data);
      return response;
    }

    // Para contraseñas, SIEMPRE devolver la respuesta tal cual
    if (response.config.url?.includes('/password')) {
      return response;
    }
    
    // Si el BFF retorna { ok: true, data: ... }, extraer los datos
    if (response.data && typeof response.data === 'object' && 'ok' in response.data) {
      if (response.data.ok === false) {
        throw new Error(response.data.error || response.data.message || 'Error del servidor');
      }
      // Retornar los datos útiles
      return {
        ...response,
        data: response.data.data || response.data
      };
    }
    
    return response;
  },
  (error) => {
    // Logging detallado del error
    console.error('❌ [apiBackend] Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    // NO limpiar localStorage aquí - eso lo maneja useAdminProtection
    // Solo loguear el error para debugging
    if (error.response?.status === 401) {
      console.warn('⚠️ [apiBackend] Error 401 - No autenticado');
    }
    
    // Extraer mensaje de error del BFF
    if (error.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data;
      
      // Intentar obtener el mensaje de error de varias formas
      let errorMessage = 'Error del servidor';
      
      if (typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      } else if (typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (errorData.error && typeof errorData.error === 'object') {
        // Si error es un objeto, intentar extraer el mensaje
        errorMessage = JSON.stringify(errorData.error);
      }
      
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
      return Promise.reject(customError);
    }
    
    return Promise.reject(error);
  }
);

export default apiBackend;
