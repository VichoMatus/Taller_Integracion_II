import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el .env de la raíz del proyecto
// En Docker, el .env se monta en /app/.env
// En desarrollo local, está en ../../../.env
dotenv.config({ 
  path: process.env.NODE_ENV === 'development' && process.cwd().includes('/app')
    ? path.resolve(__dirname, '../../.env')     // Docker (montado en /app/.env)
    : path.resolve(__dirname, '../../../.env')  // Desarrollo local
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
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    updateMe: '/auth/me',
    changePassword: '/auth/me/password',
    pushToken: '/auth/me/push-token',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    sendVerification: '/auth/send-verification', 
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
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