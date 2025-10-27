import axios, { AxiosInstance } from "axios";

/**
 * Factory para crear cliente HTTP configurado con autenticación automática.
 * Configura interceptores para agregar tokens Bearer automáticamente.
 *
 * @param baseURL - URL base para todas las requests (sin /api/v1, se agrega automáticamente)
 * @param getToken - Función opcional para obtener token de autenticación
 * @returns Instancia de Axios configurada
 *
 * @example
 * ```typescript
 * const client = buildHttpClient("https://api.example.com", () => "my-token");
 * // baseURL final: https://api.example.com/api/v1
 * // Todas las requests incluirán automáticamente: Authorization: Bearer my-token
 * ```
 */
export const buildHttpClient = (baseURL: string, getToken?: () => string | undefined): AxiosInstance => {
  // Agregar /api/v1 automáticamente si no está presente (compatibilidad con Taller4/FastAPI)
  let finalBaseURL = baseURL;
  if (!baseURL.endsWith('/api/v1')) {
    finalBaseURL = `${baseURL.replace(/\/$/, '')}/api/v1`;
  }
  
  const client = axios.create({ baseURL: finalBaseURL, timeout: 10000 });

  // Interceptor para agregar token de autenticación automáticamente
  client.interceptors.request.use(cfg => {
    const t = getToken?.();
    if (t) {
      if (!cfg.headers) {
        cfg.headers = {} as any;
      }
      cfg.headers["Authorization"] = `Bearer ${t}`;
    }
    return cfg;
  });

  return client;
};
