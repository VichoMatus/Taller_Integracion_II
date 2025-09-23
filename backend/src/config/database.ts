import { ENV } from "./env";

/**
 * Configuración de base de datos.
 */
export interface DatabaseConfig {
  /** URL de conexión */
  url?: string;
  /** Host del servidor */
  host?: string;
  /** Puerto de conexión */
  port?: number;
  /** Nombre de la base de datos */
  database?: string;
  /** Usuario de conexión */
  username?: string;
  /** Contraseña de conexión */
  password?: string;
  /** Configuraciones adicionales */
  options?: {
    /** Pool de conexiones mínimo */
    minConnections?: number;
    /** Pool de conexiones máximo */
    maxConnections?: number;
    /** Timeout de conexión en ms */
    connectionTimeout?: number;
    /** Habilitar logging de queries */
    logging?: boolean;
  };
}

/**
 * Parsea la URL de base de datos y extrae componentes.
 * @param url - URL de conexión
 * @returns Componentes de la configuración
 */
const parseDatabaseUrl = (url: string): Partial<DatabaseConfig> => {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port) : undefined,
      database: parsed.pathname.slice(1), // Remover slash inicial
      username: parsed.username,
      password: parsed.password,
    };
  } catch (error) {
    console.warn("Error parsing database URL:", error);
    return {};
  }
};

/**
 * Configuración de base de datos basada en variables de entorno.
 */
export const databaseConfig: DatabaseConfig = {
  url: ENV.DATABASE_URL,
  ...ENV.DATABASE_URL ? parseDatabaseUrl(ENV.DATABASE_URL) : {},
  options: {
    minConnections: 2,
    maxConnections: 20,
    connectionTimeout: 10000,
    logging: !ENV.NODE_ENV || ENV.NODE_ENV === "development",
  },
};
