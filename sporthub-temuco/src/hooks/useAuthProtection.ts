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
      
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');

        if (!token) {
          router.push('/login');
          return;
        }

        const storedRole = localStorage.getItem('user_role') as UserRole | null;
        const storedUserData = localStorage.getItem('userData');

        // Verificar rol almacenado sin normalización
        if (storedRole && storedUserData && allowedRoles.includes(storedRole)) {
          return;
        }

        // Verificar con el backend si no hay rol válido almacenado
        const response = await apiBackend.get('/auth/me');
        const userData = response.data?.data || response.data;

        if (!userData || !userData.rol) {
          throw new Error('Datos de usuario inválidos');
        }

        // Verificar rol sin normalización
        const userRole = userData.rol as UserRole;
        const isRoleAllowed = allowedRoles.includes(userRole);

        if (!isRoleAllowed) {
          localStorage.removeItem('userData');
          localStorage.removeItem('user_role');
          
          // Redirigir según el rol
          if (userRole === 'admin') {
            router.push('/admin');
          } else if (userRole === 'usuario') {
            router.push('/sports');
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            router.push('/login');
          }
          return;
        }

        // Guardar datos exactamente como vienen del backend
        try {
          const token = localStorage.getItem('access_token') || localStorage.getItem('token');
          if (!token) {
            throw new Error('Token no encontrado después de /auth/me');
          }

          localStorage.setItem('access_token', token);
          localStorage.setItem('token', token);
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('user_role', userRole);
        } catch (err) {
          console.error('❌ Error guardando datos de autenticación:', err);
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