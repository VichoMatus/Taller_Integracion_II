'use client';

import { useAuthProtection } from './useAuthProtection';

/**
 * Hook para proteger rutas que requieren permisos de superadmin
 * Utiliza el hook común useAuthProtection configurado para roles de superadmin
 */
export const useSuperAdminProtection = () => {
  useAuthProtection(['superadmin', 'super_admin']);
};
