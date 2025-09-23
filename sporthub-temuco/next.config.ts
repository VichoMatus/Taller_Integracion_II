import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:19006",
    "http://localhost:8081",
    "http://localhost:3000"
  ]
  // ESLint y TypeScript habilitados para verificar errores
};

export default nextConfig;
