import { Request, Response, NextFunction } from "express";
import { fail } from "../../../interfaces/apiEnvelope";

/**
 * Middleware de autorización basado en roles.
 * Verifica que el usuario tenga uno de los roles requeridos para acceder al endpoint.
 *
 * @param roles - Lista de roles permitidos para acceder al recurso
 * @returns Middleware de Express que valida autorización
 *
 * @example
 * ```typescript
 * router.get("/admin-only", requireRole("admin", "superadmin"), handler);
 * ```
 */
export const requireRole =
  (...roles: Array<"admin" | "superadmin">) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Obtiene el rol del usuario autenticado o header de prueba
    const role =
      (req as any)?.user?.rol || (req.headers["x-user-role"] as string | undefined);

    if (!role) return res.status(401).json(fail(401, "No autenticado"));
    if (!roles.includes(role as any)) return res.status(403).json(fail(403, "Permisos insuficientes"));

    next();
  };
