import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:19006",
    "http://localhost:8081",
    "http://localhost:3000"
  ],
  eslint: {
    // Ignorar errores de ESLint durante el build en producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de TypeScript durante el build en producción
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
