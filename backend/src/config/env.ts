import { config } from "dotenv";

// Cargar variables de entorno desde .env
config();

/**
 * Configuración centralizada de variables de entorno.
 * Valida que todas las variables requeridas estén presentes.
 */
interface Environment {
  /** Puerto del servidor */
  PORT: number;
  /** Ambiente de ejecución */
  NODE_ENV: string;
  /** URL del servicio FastAPI */
  FASTAPI_URL: string;
  /** Secreto para JWT */
  JWT_SECRET: string;
  /** URL de la base de datos */
  DATABASE_URL?: string;
  /** Nivel de logging */
  LOG_LEVEL: string;
  /** CORS origin permitido */
  CORS_ORIGIN: string;
  /** Configuración Cloudflare R2 */
  CLOUDFLARE_R2_ENDPOINT: string;
  CLOUDFLARE_R2_ACCESS_KEY: string;
  CLOUDFLARE_R2_SECRET_KEY: string;
  CLOUDFLARE_R2_BUCKET: string;
}

/**
 * Valida que una variable de entorno esté presente.
 * @param key - Nombre de la variable
 * @param defaultValue - Valor por defecto (opcional)
 * @returns Valor de la variable
 */
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Variable de entorno requerida no encontrada: ${key}`);
  }
  return value;
};

/**
 * Configuración exportada con validación.
 */
export const ENV: Environment = {
  PORT: parseInt(getEnvVar("PORT", "3000")),
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  FASTAPI_URL: getEnvVar("FASTAPI_URL", process.env.API_BASE_URL || "http://localhost:8000"),
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  DATABASE_URL: process.env.DATABASE_URL,
  LOG_LEVEL: getEnvVar("LOG_LEVEL", "info"),
  CORS_ORIGIN: getEnvVar("CORS_ORIGIN", "*"),
  CLOUDFLARE_R2_ENDPOINT: getEnvVar("URL3_Subida_Canchas"),
  CLOUDFLARE_R2_ACCESS_KEY: getEnvVar("ID_Subida_Canchas"),
  CLOUDFLARE_R2_SECRET_KEY: getEnvVar("Clave_Subida_Canchas"),
  CLOUDFLARE_R2_BUCKET: getEnvVar("BUCKET_Subida_Canchas"),
};

/**
 * Verifica si estamos en ambiente de desarrollo.
 */
export const isDevelopment = () => ENV.NODE_ENV === "development";

/**
 * Verifica si estamos en ambiente de producción.
 */
export const isProduction = () => ENV.NODE_ENV === "production";

/**
 * Verifica si estamos en ambiente de testing.
 */
export const isTesting = () => ENV.NODE_ENV === "test";
