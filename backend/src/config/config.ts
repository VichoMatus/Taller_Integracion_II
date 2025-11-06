import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el único archivo .env de la raíz
const rootPath = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(rootPath, '.env') });

// Log de configuración para debugging
console.log('🔧 Config: Variables cargadas desde .env:', {
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: process.env.API_BASE_URL,
  BFF_PORT: process.env.BFF_PORT
});

/**
 * VALIDACIÓN DE VARIABLES DE ENTORNO REQUERIDAS
 * =============================================
 */
const requiredEnvVars = ['API_BASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('🚨 ERROR: Variables de entorno faltantes:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('💡 Asegúrate de tener un archivo .env con estas variables configuradas');
  process.exit(1);
}

// Configuración para la API de FastAPI
export const API_CONFIG = {
  baseURL: process.env.API_BASE_URL!,  // Ya validamos que existe arriba
  apiKey: process.env.API_KEY || '',
  timeout: parseInt(process.env.API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Configuración de los endpoints de la API
export const API_ENDPOINTS = {
  // Endpoints de autenticación
  auth: {
    registerInit: '/api/v1/auth/register/init',
    registerVerify: '/api/v1/auth/register/verify',
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
    updateMe: '/api/v1/auth/me',
    changePassword: '/api/v1/auth/me/password',
    pushToken: '/api/v1/auth/me/push-token',
    verifyEmail: '/api/v1/auth/verify-email',
    resendVerification: '/api/v1/auth/resend-verification',
    sendVerification: '/api/v1/auth/send-verification', 
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
  
  // Endpoints de canchas
  canchas: {
    base: '/api/v1/canchas',
    byId: (id: number) => `/api/v1/canchas/${id}`
  },
  
  // Endpoints de reservas
  reservas: {
    base: '/api/v1/reservas',
    byId: (id: number) => `/api/v1/reservas/${id}`
  },
  
  // Endpoints de reseñas
  resenas: {
    base: '/api/v1/resenas'
  },
  
  // Endpoints específicos de SuperAdmin
  super_admin: {
    parametros: '/api/v1/super_admin/parametros',
    estadisticas: '/api/v1/super_admin/estadisticas',
    logs: '/api/v1/super_admin/logs'
  }
};