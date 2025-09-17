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
  // Rutas específicas para el SuperAdmin
  superAdmin: {
    login: '/auth/login',
    users: '/admin/users',
    reports: '/admin/reports',
    dashboard: '/admin/dashboard',
    settings: '/admin/settings',
    // Añade aquí más endpoints según sea necesario
  }
};