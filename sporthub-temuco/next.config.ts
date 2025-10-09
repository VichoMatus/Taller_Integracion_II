import type { NextConfig } from "next";

// Cargar variables de entorno desde la raíz del workspace solo en desarrollo
if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
  try {
    const { config } = require('dotenv');
    const { resolve } = require('path');
    config({ path: resolve(__dirname, '../.env') });
  } catch (error) {
    // Si dotenv no está disponible, continuar sin error
    console.warn('dotenv no disponible, usando variables de sistema');
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:19006",
    "http://localhost:8081",
    "http://localhost:3000"
  ],
  // ESLint y TypeScript habilitados para verificar errores
  
  // Asegurar que las variables de entorno se expongan correctamente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Para depuración: mostrar las variables de entorno en build time
  async generateBuildId() {
    console.log('🔍 Variables de entorno en build time:');
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    return 'custom-build-id-' + Date.now();
  }
};

export default nextConfig;
