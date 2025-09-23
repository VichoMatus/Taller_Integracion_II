export * from "./env";
export * from "./database";
export * from "./cors";
export * from "./logger";

/**
 * Configuración global de la aplicación.
 * Centraliza todas las configuraciones en un solo lugar.
 */
export const appConfig = {
  // Re-exportar para fácil acceso
  env: () => import("./env"),
  database: () => import("./database"),
  cors: () => import("./cors"),
  logger: () => import("./logger"),
} as const;
