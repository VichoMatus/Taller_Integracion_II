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
  // En cliente: detecta por hostname
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:4000'
      : 'https://backend-mn66n6-82bd05-168-232-167-73.traefik.me';
  }
  // En servidor: usa variable de entorno o localhost por defecto
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
});

// Interceptor para agregar token automáticamente
apiBackend.interceptors.request.use(
  (config) => {
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
    // Manejar errores de auth
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
    
    // Extraer mensaje de error del BFF
    if (error.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data;
      if ('error' in errorData) {
        throw new Error(errorData.error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiBackend;
