import { AxiosError } from "axios";

/**
 * Convierte errores de Axios en errores estandarizados con información detallada.
 * Extrae códigos de estado, mensajes y detalles de las respuestas HTTP.
 *
 * @param e - Error de Axios o error genérico
 * @returns Error normalizado con statusCode y detalles
 *
 * @example
 * ```typescript
 * try {
 *   await axios.get('/api/users/999');
 * } catch (e) {
 *   throw httpError(e); // Error con statusCode: 404, message: "Usuario no encontrado"
 * }
 * ```
 */
export const httpError = (e: unknown) => {
  const ax = e as AxiosError<any>;
  const code = ax?.response?.status ?? 500;

  // Extrae mensaje de error de diferentes formatos de respuesta
  const message =
    (ax?.response?.data as any)?.detail || // FastAPI format
    (ax?.response?.data as any)?.message || // Generic format
    ax?.message || // Axios message
    "Error"; // Fallback

  // Crea error personalizado con información HTTP
  const err: any = new Error(message);
  err.statusCode = code;
  err.details = ax?.response?.data;
  return err;
};
