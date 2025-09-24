import type { Request } from "express";

/**
 * Extrae el token Bearer del header Authorization de una request HTTP.
 *
 * @param req - Request de Express
 * @returns Token Bearer sin el prefijo "Bearer " o undefined si no existe
 *
 * @example
 * ```typescript
 * // Header: "Authorization: Bearer abc123"
 * const token = getBearerFromReq(req); // "abc123"
 * ```
 */
export const getBearerFromReq = (req: Request): string | undefined => {
  const a = req.headers?.authorization;
  return a?.startsWith("Bearer ") ? a.slice(7) : undefined;
};
