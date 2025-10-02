import { ENV, isDevelopment } from "./env";

/**
 * Configuración de CORS para Express.
 */
export const corsConfig = {
  /** Orígenes permitidos */
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // En desarrollo, permitir cualquier origen
    if (isDevelopment()) {
      return callback(null, true);
    }

    // En producción, validar origen específico
    const allowedOrigins = ENV.CORS_ORIGIN.split(",").map(o => o.trim());
    
    // Permitir requests sin origin (ej: aplicaciones móviles, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"), false);
    }
  },
  
  /** Métodos HTTP permitidos */
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  
  /** Headers permitidos */
  allowedHeaders: [
    "Origin",
    "X-Requested-With", 
    "Content-Type", 
    "Accept",
    "Authorization",
    "X-User-Role", // Para testing
  ],
  
  /** Incluir credenciales */
  credentials: true,
  
  /** Tiempo de cache para preflight */
  maxAge: 86400, // 24 horas
};
