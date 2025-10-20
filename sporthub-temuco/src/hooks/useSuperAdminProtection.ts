'use client';

import { useAuthProtection } from './useAuthProtection';

/**
 * Hook para proteger rutas que requieren permisos de super_admin
 * 
 * 🔥 ACTUALIZADO: Ya no hay super_admin en la API, todos se convirtieron a admin
 * Ahora permite acceso a usuarios con rol 'admin', 'super_admin' (legacy), o 'super_admin' (legacy)
 * 
 * Utiliza el hook común useAuthProtection configurado para roles administrativos
 */
export const useSuperAdminProtection = () => {
  useAuthProtection(['admin', 'super_admin', 'super_admin']);
};
