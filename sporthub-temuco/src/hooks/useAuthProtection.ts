'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiBackend } from '@/config/backend';

type UserRole = 'admin' | 'superadmin' | 'super_admin' | 'usuario';

interface UserData {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: string;
}

export const useAuthProtection = (allowedRoles: UserRole[]) => {
  const router = useRouter();
  const pathname = usePathname();
  const isCheckingRef = useRef(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Reset hasChecked when pathname changes
    hasCheckedRef.current = false;
  }, [pathname]);

  useEffect(() => {
    if (isCheckingRef.current || hasCheckedRef.current) {
      return;
    }

    const checkAuth = async () => {
      if (isCheckingRef.current) return;
      
      isCheckingRef.current = true;
      console.log('🔍 [useAuthProtection] Iniciando verificación...', { pathname, allowedRoles });
      
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        if (!token) {
          console.log('❌ [useAuthProtection] No hay token');
          router.push('/login');
          return;
        }

        const storedRole = localStorage.getItem('user_role');
        const storedUserData = localStorage.getItem('userData');
        
        console.log('🔍 [useAuthProtection] Datos almacenados:', { 
          storedRole, 
          hasStoredData: !!storedUserData 
        });

        if (storedRole && storedUserData) {
          // 🔥 NORMALIZAR: super_admin → superadmin, ADMIN → admin, etc.
          const normalizedStoredRole = storedRole.toLowerCase().trim() === 'super_admin' 
            ? 'superadmin' 
            : storedRole.toLowerCase().trim();
          const isRoleAllowed = allowedRoles.some(role => 
            role.toLowerCase().trim() === normalizedStoredRole
          );
          if (isRoleAllowed) {
            console.log('✅ [useAuthProtection] Usando datos almacenados:', {
              rolAlmacenado: storedRole,
              rolNormalizado: normalizedStoredRole,
              rolesPermitidos: allowedRoles
            });
            return;
          }
        }

        console.log('🔍 [useAuthProtection] Verificando con /auth/me...');
        const response = await apiBackend.get('/auth/me');
        const userData = response.data?.data || response.data;

        if (!userData || !userData.rol) {
          throw new Error('Datos de usuario inválidos');
        }

        console.log('📦 [useAuthProtection] Datos recibidos:', userData);

        // 🔥 NORMALIZAR: super_admin → superadmin, ADMIN → admin, etc.
        const normalizedRole = userData.rol.toLowerCase().trim() === 'super_admin' 
          ? 'superadmin' 
          : userData.rol.toLowerCase().trim();
        const isRoleAllowed = allowedRoles.some(role => 
          role.toLowerCase().trim() === normalizedRole
        );

        if (!isRoleAllowed) {
          console.log('❌ [useAuthProtection] Rol no permitido:', {
            rol: normalizedRole,
            rolesPermitidos: allowedRoles
          });

          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('userData');
          localStorage.removeItem('user_role');

          if (normalizedRole === 'admin') {
            router.push('/admin');
          } else if (normalizedRole === 'usuario') {
            router.push('/sports');
          } else {
            router.push('/login');
          }
          return;
        }

        // 🔥 CORREGIDO: Guardar rol normalizado
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('user_role', normalizedRole);

        console.log('✅ [useAuthProtection] Acceso autorizado:', {
          rol: normalizedRole,
          rolesPermitidos: allowedRoles
        });

      } catch (error) {
        console.error('❌ [useAuthProtection] Error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userData');
        localStorage.removeItem('user_role');
        router.push('/login');
      } finally {
        isCheckingRef.current = false;
        hasCheckedRef.current = true;
      }
    };

    checkAuth();

    return () => {
      hasCheckedRef.current = false;
    };
  }, [router, pathname, allowedRoles]);
};