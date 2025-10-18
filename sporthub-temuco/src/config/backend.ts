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
  // Prioridad 1: Variable de entorno explícita
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  
  // Prioridad 2: En cliente, detecta por hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000';
    }
    
    // Autodetección por hostname del frontend
    // Si el frontend contiene develop/staging/test → backend develop
    if (hostname.includes('develop') || hostname.includes('staging') || hostname.includes('test')) {
      return 'https://backend-develop-0kbdnu-ec3ee3-168-232-167-73.traefik.me';
    }
    
    // Por defecto: backend main (producción)
    return 'https://backend-mn66n6-82bd05-168-232-167-73.traefik.me';
  }
  
  // Prioridad 3: En servidor, localhost por defecto
  return 'http://localhost:4000';
};

const BACKEND_BASE_URL = getBackendUrl();

export const BACKEND_URL = BACKEND_BASE_URL; // Para uso directo
export const API_BASE_URL = `${BACKEND_BASE_URL}/api`; // Para API calls

console.log('🔧 Backend config loaded:', { BACKEND_BASE_URL, API_BASE_URL });

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
    // Si el BFF retorna { ok: true, data: ... }, extraer los datos
    if (response.data && typeof response.data === 'object' && 'ok' in response.data) {
      if (response.data.ok === false) {
        throw new Error(response.data.error || 'Error del servidor');
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
