'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiBackend } from '@/config/backend';

type UserRole = 'admin' | 'super_admin' | 'usuario';

interface UserData {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: UserRole;
}

export const useAuthProtection = (allowedRoles: UserRole[]) => {
  const router = useRouter();
  const pathname = usePathname();
  const isCheckingRef = useRef(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    hasCheckedRef.current = false;
  }, [pathname]);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    if (isCheckingRef.current || hasCheckedRef.current) return;

    const checkAuth = async () => {
      if (isCheckingRef.current) return;
      
      isCheckingRef.current = true;
      console.log('🔍 [useAuthProtection] Iniciando verificación...', { pathname, allowedRoles });
      
      try {
        // Intentar obtener el token
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        console.log('🔐 [useAuthProtection] Estado del token:', {
          hasAccessToken: !!localStorage.getItem('access_token'),
          hasLegacyToken: !!localStorage.getItem('token'),
          finalToken: !!token
        });

        if (!token) {
          console.log('❌ [useAuthProtection] No hay token - Redirigiendo a login');
          router.push('/login');
          return;
        }

        const storedRole = localStorage.getItem('user_role') as UserRole | null;
        const storedUserData = localStorage.getItem('userData');
        
        console.log('🔍 [useAuthProtection] Datos almacenados:', { 
          storedRole, 
          hasStoredData: !!storedUserData 
        });

        // Verificar rol almacenado sin normalización
        if (storedRole && storedUserData && allowedRoles.includes(storedRole)) {
          console.log('✅ [useAuthProtection] Rol permitido:', storedRole);
          return;
        }

        // Verificar con el backend si no hay rol válido almacenado
        console.log('🔍 [useAuthProtection] Verificando con /auth/me...');
        const response = await apiBackend.get('/auth/me');
        const userData = response.data?.data || response.data;

        if (!userData || !userData.rol) {
          throw new Error('Datos de usuario inválidos');
        }

        console.log('📦 [useAuthProtection] Datos recibidos:', userData);

        // Verificar rol sin normalización
        const userRole = userData.rol as UserRole;
        const isRoleAllowed = allowedRoles.includes(userRole);

        if (!isRoleAllowed) {
          console.log('❌ [useAuthProtection] Rol no permitido:', {
            rol: userRole,
            rolesPermitidos: allowedRoles
          });

          // En lugar de limpiar todo el localStorage, solo limpiamos los datos del usuario
          localStorage.removeItem('userData');
          localStorage.removeItem('user_role');
          
          // Redirigir según el rol
          if (userRole === 'admin') {
            router.push('/admin');
          } else if (userRole === 'usuario') {
            router.push('/sports');
          } else {
            // Antes de redirigir a login, limpiamos los tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            router.push('/login');
          }
          return;
        }

        // Guardar datos exactamente como vienen del backend y el token actual
        try {
          // Primero verificar el token actual
          const token = localStorage.getItem('access_token') || localStorage.getItem('token');
          if (!token) {
            throw new Error('Token no encontrado después de /auth/me');
          }

          // Guardar o actualizar datos
          localStorage.setItem('access_token', token);
          localStorage.setItem('token', token); // Mantener compatibilidad
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('user_role', userRole);

          console.log('✅ [useAuthProtection] Datos actualizados:', {
            rol: userRole,
            rolesPermitidos: allowedRoles,
            token: true,
            userData: true
          });
        } catch (err) {
          console.error('❌ [useAuthProtection] Error guardando datos:', err);
          router.push('/login');
          return;
        }

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