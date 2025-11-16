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
  
  // � DESARROLLO LOCAL: Si NODE_ENV es development, siempre usar localhost
  if (process.env.NODE_ENV === 'development') {
    console.log('💻 [getBackendUrl] DESARROLLO LOCAL → localhost:4000');
    return 'http://localhost:4000';
  }
  
  // �🚨 HARDCODE TEMPORAL: Para resolver problemas de caché en producción
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
console.log('🔧 [apiBackend] Creando instancia de axios con baseURL:', API_BASE_URL);

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

console.log('✅ [apiBackend] Instancia creada, baseURL configurado:', apiBackend.defaults.baseURL);

// Interceptor para agregar token automáticamente
apiBackend.interceptors.request.use(
  (config) => {
    // Configurar baseURL dinámicamente
    if (!config.baseURL) {
      config.baseURL = API_BASE_URL;
    }
    
    console.log('🔍 [apiBackend] Request interceptor:', {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: config.baseURL + config.url,
      method: config.method
    });
    
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
      console.log('🔍 [apiBackend] Respuesta con estructura {ok, data}:', {
        ok: response.data.ok,
        hasData: 'data' in response.data,
        dataType: typeof response.data.data,
        dataKeys: response.data.data ? Object.keys(response.data.data) : [],
        fullResponse: response.data
      });
      
      if (response.data.ok === false) {
        // Log completo para debugging
        console.log('🔍 [apiBackend] Error response.data:', response.data);
        console.log('🔍 [apiBackend] Error tipo:', typeof response.data.error);
        console.log('🔍 [apiBackend] Error isArray:', Array.isArray(response.data.error));
        console.log('🔍 [apiBackend] Error contenido:', response.data.error);
        console.log('🔍 [apiBackend] Error details:', response.data.error?.details);
        
        // Extraer mensaje de error del objeto
        let errorMessage = 'Error del servidor';
        if (response.data.error) {
          // 1. Si hay details.detail (formato Pydantic de FastAPI)
          if (response.data.error.details?.detail) {
            const detail = response.data.error.details.detail;
            console.log('🔍 [apiBackend] Pydantic detail tipo:', typeof detail);
            console.log('🔍 [apiBackend] Pydantic detail isArray:', Array.isArray(detail));
            console.log('🔍 [apiBackend] Pydantic detail contenido:', detail);
            
            if (Array.isArray(detail)) {
              // Formato Pydantic: [{ type, loc, msg, input }, ...]
              errorMessage = detail.map((e: any) => {
                if (e.msg) {
                  const field = Array.isArray(e.loc) ? e.loc.filter((l: any) => l !== 'body').join('.') : '';
                  return field ? `${field}: ${e.msg}` : e.msg;
                }
                return e.message || JSON.stringify(e);
              }).join(' | ');
            } else if (typeof detail === 'string') {
              errorMessage = detail;
            } else if (typeof detail === 'object') {
              errorMessage = JSON.stringify(detail);
            }
          }
          // 2. Si hay details (pero no detail)
          else if (response.data.error.details) {
            const details = response.data.error.details;
            console.log('🔍 [apiBackend] Details tipo:', typeof details);
            console.log('🔍 [apiBackend] Details isArray:', Array.isArray(details));
            console.log('🔍 [apiBackend] Details contenido completo:', details);
            
            if (Array.isArray(details)) {
              errorMessage = details.map((e: any) => {
                if (typeof e === 'object') {
                  return e.message || e.msg || e.error || JSON.stringify(e);
                }
                return String(e);
              }).join(', ');
            } else if (typeof details === 'object') {
              errorMessage = JSON.stringify(details);
            } else {
              errorMessage = String(details);
            }
          }
          // 3. Si error es un array directamente
          else if (Array.isArray(response.data.error)) {
            errorMessage = response.data.error.map((e: any) => {
              if (typeof e === 'object') {
                return e.message || e.msg || e.error || JSON.stringify(e);
              }
              return String(e);
            }).join(', ');
          }
          // 4. Si error.message existe y NO es "[object Object]"
          else if (typeof response.data.error === 'object') {
            const msg = response.data.error.message || response.data.error.msg;
            if (msg && !msg.includes('[object Object]')) {
              errorMessage = msg;
            } else {
              errorMessage = JSON.stringify(response.data.error);
            }
          }
          // 5. Fallback
          else {
            errorMessage = String(response.data.error);
          }
        } else if (response.data.message) {
          errorMessage = response.data.message;
        }
        
        console.error('❌ [apiBackend] Error del BFF:', errorMessage, response.data);
        
        // 🔥 IMPORTANTE: Preservar el objeto response para que el código pueda detectar el status
        const error = new Error(errorMessage) as any;
        error.response = response;
        error.status = response.status;
        throw error;
      }
      
      // Si ok === true, extraer los datos
      const extractedData = response.data.data;
      return {
        ...response,
        data: extractedData
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
