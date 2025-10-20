'use client';

import { useAuthProtection } from './useAuthProtection';

/**
 * Hook para proteger rutas que requieren permisos de superadmin
 * 
 * 🔥 ACTUALIZADO: Ya no hay super_admin en la API, todos se convirtieron a admin
 * Ahora permite acceso a usuarios con rol 'admin', 'superadmin' (legacy), o 'super_admin' (legacy)
 * 
 * Utiliza el hook común useAuthProtection configurado para roles administrativos
 */
export const useSuperAdminProtection = () => {
  useAuthProtection(['admin', 'superadmin', 'super_admin']);
};
