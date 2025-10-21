'use client';

import { useAuthProtection } from './useAuthProtection';

/**
 * Hook para proteger rutas que requieren permisos de super_admin
 * 
 * Utiliza el hook común useAuthProtection configurado para roles administrativos
 * Solo permite acceso a usuarios con rol 'super_admin'
 */
export const useSuperAdminProtection = () => {
  useAuthProtection(['super_admin']);
};
