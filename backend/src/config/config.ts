import dotenv from 'dotenv';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Configuración para la API de FastAPI
export const API_CONFIG = {
  baseURL: process.env.API_BASE_URL || 'https://api.opencloude.com',
  apiKey: process.env.API_KEY || '',
  timeout: parseInt(process.env.API_TIMEOUT || '5000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Configuración de los endpoints de la API
export const API_ENDPOINTS = {
  // Endpoints de autenticación
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
    updateMe: '/api/v1/auth/me',
    changePassword: '/api/v1/auth/me/password',
    pushToken: '/api/v1/auth/me/push-token',
    verifyEmail: '/api/v1/auth/verify-email',
    resendVerification: '/api/v1/auth/resend-verification',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password'
  },
  
  // Endpoints de usuarios
  usuarios: {
    base: '/api/v1/usuarios',
    byId: (id: number) => `/api/v1/usuarios/${id}`
  },
  
  // Endpoints de complejos deportivos
  complejos: {
    base: '/api/v1/complejos',
    byId: (id: number) => `/api/v1/complejos/${id}`,
    canchas: (id: number) => `/api/v1/complejos/${id}/canchas`
  },
  
  // Endpoints específicos de SuperAdmin
  superadmin: {
    parametros: '/api/v1/superadmin/parametros',
    estadisticas: '/api/v1/superadmin/estadisticas',
    logs: '/api/v1/superadmin/logs'
  }
};