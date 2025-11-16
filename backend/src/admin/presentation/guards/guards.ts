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
 * router.get("/admin-only", requireRole("admin", "super_admin"), handler);
 * ```
 */
export const requireRole =
  (...roles: Array<"admin" | "super_admin">) =>
  (req: Request, res: Response, next: NextFunction) => {
    // 🔥 Obtiene el rol del usuario autenticado (soporta 'role' y 'rol')
    const user = (req as any)?.user;
    const role = user?.rol || user?.role || (req.headers["x-user-role"] as string | undefined);

    console.log('🔍 [requireRole] Verificando roles:', {
      requiredRoles: roles,
      userRole: role,
      hasUser: !!user,
      userRol: user?.rol,
      userRole: user?.role
    });

    if (!role) {
      console.warn('⚠️ [requireRole] No autenticado - sin rol');
      return res.status(401).json(fail(401, "No autenticado"));
    }

    if (!roles.includes(role as any)) {
      console.warn('⚠️ [requireRole] Permisos insuficientes:', {
        userRole: role,
        requiredRoles: roles
      });
      return res.status(403).json(fail(403, "Permisos insuficientes - requiere rol de administrador"));
    }

    console.log('✅ [requireRole] Acceso autorizado:', role);
    next();
  };

/**
 * Middleware específico para owners de complejos.
 * Verifica que el usuario sea dueño o admin.
 */
export const requireOwner = requireRole("admin", "super_admin");
