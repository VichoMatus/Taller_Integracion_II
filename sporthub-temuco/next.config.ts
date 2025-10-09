import type { NextConfig } from "next";
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde la raíz del workspace
config({ path: resolve(__dirname, '../.env') });

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
