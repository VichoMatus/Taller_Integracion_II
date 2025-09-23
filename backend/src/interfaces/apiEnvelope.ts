/**
 * Estructura para errores de API consistente.
 */
export interface ApiError {
  /** Código de error HTTP */
  code: number;
  /** Mensaje descriptivo del error */
  message: string;
  /** Detalles adicionales del error (opcional) */
  details?: unknown;
}

/**
 * Envelope estándar para respuestas de API.
 * Proporciona estructura consistente para éxito y errores.
 *
 * @template T - Tipo de datos en caso de éxito
 */
export interface ApiEnvelope<T> {
  /** Indica si la operación fue exitosa */
  ok: boolean;
  /** Datos de respuesta en caso de éxito */
  data?: T;
  /** Información del error en caso de fallo */
  error?: ApiError;
}

/**
 * Crea un envelope de respuesta exitosa.
 *
 * @template T - Tipo de los datos
 * @param data - Datos a incluir en la respuesta
 * @returns Envelope con indicador de éxito y datos
 *
 * @example
 * ```typescript
 * const response = ok({ id: 1, name: "User" });
 * // { ok: true, data: { id: 1, name: "User" } }
 * ```
 */
export const ok = <T>(data: T): ApiEnvelope<T> => ({ ok: true, data });

/**
 * Crea un envelope de respuesta de error.
 *
 * @param code - Código de error HTTP
 * @param message - Mensaje descriptivo del error
 * @param details - Detalles adicionales del error (opcional)
 * @returns Envelope con indicador de error y información del fallo
 *
 * @example
 * ```typescript
 * const response = fail(404, "Usuario no encontrado");
 * // { ok: false, error: { code: 404, message: "Usuario no encontrado" } }
 * ```
 */
export const fail = (
  code: number,
  message: string,
  details?: unknown
): ApiEnvelope<never> => ({
  ok: false,
  error: { code, message, details },
});
