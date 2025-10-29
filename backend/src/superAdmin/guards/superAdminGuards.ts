/**
 * GUARDS DE SEGURIDAD PARA MÓDULO SUPERADMIN
 * ==========================================
 * 
 * Este archivo define los middlewares de autorización específicos para SuperAdmin.
 * Proporciona validación de roles y permisos para rutas administrativas críticas.
 * 
 * Diferencias con Admin Guards:
 * - Solo acepta rol 'super_admin' (máximo nivel de privilegios)
 * - Maneja normalización de roles desde auth (super_admin → super_admin)
 * - Incluye logging de seguridad para auditoría
 * 
 * Uso:
 * ```typescript
 * import { requireSuperAdmin } from './guards/superAdminGuards';
 * router.get('/users', authMiddleware, requireSuperAdmin, controller.getUsers);
 * ```
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Función de utilidad para generar respuestas de error estandarizadas
 */
const fail = (code: number, message: string) => ({
  ok: false,
  error: { code, message }
});

/**
 * GUARD PRINCIPAL: requireSuperAdmin
 * ==================================
 * 
 * Middleware que valida que el usuario tenga rol de SuperAdmin.
 * Debe usarse DESPUÉS de authMiddleware para que req.user esté disponible.
 * 
 * @param req - Request object (debe tener req.user del authMiddleware)
 * @param res - Response object
 * @param next - Next function
 * 
 * Flujo:
 * 1. Verifica que req.user existe (authMiddleware ya ejecutado)
 * 2. Extrae el rol del usuario
 * 3. Normaliza roles inconsistentes (super_admin → super_admin)
 * 4. Valida que el rol sea exactamente 'super_admin'
 * 5. Log de auditoría para accesos de seguridad
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Verificar que el usuario esté autenticado
    const user = (req as any)?.user;
    if (!user) {
      console.warn(`[SuperAdmin Security] Acceso denegado - Usuario no autenticado en ${req.method} ${req.path}`);
      return res.status(401).json(fail(401, "Usuario no autenticado"));
    }

    // 2. Extraer rol del usuario
    let userRole = user.rol;
    if (!userRole) {
      console.warn(`[SuperAdmin Security] Acceso denegado - Rol no definido para usuario ${user.sub || user.id} en ${req.method} ${req.path}`);
      return res.status(403).json(fail(403, "Rol de usuario no definido"));
    }

    // 3. Normalización de roles (compatibilidad con diferentes módulos)
    const normalizedRole = normalizeRole(userRole);

    // 4. Validar rol SuperAdmin
    if (normalizedRole !== 'super_admin') {
      console.warn(`[SuperAdmin Security] Acceso denegado - Rol insuficiente: ${userRole} (normalizado: ${normalizedRole}) para usuario ${user.id} en ${req.method} ${req.path}`);
      return res.status(403).json(fail(403, "Permisos insuficientes - Se requiere rol SuperAdmin"));
    }

    // 5. Log de auditoría para accesos exitosos
    console.log(`[SuperAdmin Security] Acceso autorizado - Usuario ${user.id} (${userRole}) accede a ${req.method} ${req.path}`);

    // 6. Continuar con el siguiente middleware
    next();
  } catch (error) {
    console.error('[SuperAdmin Security] Error en validación de permisos:', error);
    return res.status(500).json(fail(500, "Error interno en validación de permisos"));
  }
};

/**
 * FUNCIÓN DE NORMALIZACIÓN DE ROLES
 * =================================
 * 
 * Maneja las inconsistencias entre los diferentes módulos del sistema:
 * - Auth module usa: 'super_admin' (con guion bajo)
 * - SuperAdmin module espera: 'super_admin' (sin guion bajo)
 * 
 * @param role - Rol original del usuario
 * @returns Rol normalizado compatible con SuperAdmin
 */
const normalizeRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'super_admin': 'super_admin',  // Auth module → SuperAdmin module
    'admin': 'admin',             // Admin regular (NO es super_admin)
    // 'dueno' rol eliminado - ahora se usa 'admin'
    'usuario': 'usuario'         // Usuario regular (NO es super_admin)
  };

  return roleMap[role] || role;
};

/**
 * GUARD ALTERNATIVO: requireSuperAdminOrSystemRole
 * ===============================================
 * 
 * Middleware más flexible que permite SuperAdmin o roles del sistema.
 * Útil para endpoints que pueden ser usados por procesos automáticos.
 * 
 * @param allowedRoles - Lista de roles permitidos además de super_admin
 */
export const requireSuperAdminOrSystemRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any)?.user;
      if (!user) {
        return res.status(401).json(fail(401, "Usuario no autenticado"));
      }

      const normalizedRole = normalizeRole(user.rol);
      
      // Permitir super_admin o roles específicos del sistema
      if (normalizedRole === 'super_admin' || allowedRoles.includes(normalizedRole)) {
        console.log(`[SuperAdmin Security] Acceso autorizado (flexible) - Usuario ${user.id} (${user.rol}) accede a ${req.method} ${req.path}`);
        next();
      } else {
        console.warn(`[SuperAdmin Security] Acceso denegado (flexible) - Rol ${normalizedRole} no permitido para ${req.method} ${req.path}`);
        return res.status(403).json(fail(403, "Permisos insuficientes"));
      }
    } catch (error) {
      console.error('[SuperAdmin Security] Error en validación flexible:', error);
      return res.status(500).json(fail(500, "Error interno en validación de permisos"));
    }
  };
};

/**
 * UTILIDAD: Función para auditoría de accesos críticos
 * ===================================================
 * 
 * Registra accesos a funciones críticas del sistema para auditoría.
 * Debe llamarse manualmente en controladores para operaciones sensibles.
 */
export const logCriticalAccess = (req: Request, action: string, details?: any) => {
  const user = (req as any)?.user;
  const timestamp = new Date().toISOString();
  const clientIP = req.ip || req.connection.remoteAddress;
  
  console.log(`[SuperAdmin Critical] ${timestamp} - Usuario ${user?.id} (${user?.rol}) realizó: ${action}`, {
    userAgent: req.get('User-Agent'),
    clientIP,
    details
  });
};

export default {
  requireSuperAdmin,
  requireSuperAdminOrSystemRole,
  logCriticalAccess
};