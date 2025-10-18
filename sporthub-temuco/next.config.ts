import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:19006",
    "http://localhost:8081",
    "http://localhost:3000"
  ],
  
  // Configuración actualizada para Next.js 15
  serverExternalPackages: ['https'],
  
  // ESLint y TypeScript habilitados para verificar errores
  
  // Asegurar que las variables de entorno se expongan correctamente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    // NODE_TLS_REJECT_UNAUTHORIZED se maneja por variables de entorno, no aquí
  },
  
  // Para depuración: mostrar las variables de entorno en build time
  async generateBuildId() {
    console.log('🔍 Variables de entorno en build time:');
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    return 'custom-build-id-' + Date.now();
  }
};

export default nextConfig;
