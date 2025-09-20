import axios, { AxiosInstance } from "axios";

/**
 * Factory para crear cliente HTTP configurado con autenticación automática.
 * Configura interceptores para agregar tokens Bearer automáticamente.
 *
 * @param baseURL - URL base para todas las requests
 * @param getToken - Función opcional para obtener token de autenticación
 * @returns Instancia de Axios configurada
 *
 * @example
 * ```typescript
 * const client = buildHttpClient("https://api.example.com", () => "my-token");
 * // Todas las requests incluirán automáticamente: Authorization: Bearer my-token
 * ```
 */
export const buildHttpClient = (baseURL: string, getToken?: () => string | undefined): AxiosInstance => {
  const client = axios.create({ baseURL, timeout: 10000 });

  // Interceptor para agregar token de autenticación automáticamente
  client.interceptors.request.use(cfg => {
    const t = getToken?.();
    if (t) {
      (cfg.headers ||= {})["Authorization"] = `Bearer ${t}`;
    }
    return cfg;
  });

  return client;
};
