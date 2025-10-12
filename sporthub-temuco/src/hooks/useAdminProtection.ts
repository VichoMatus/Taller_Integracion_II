'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { apiBackend } from '@/config/backend';

interface UserData {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export const useAdminProtection = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si existe un token
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Verificar que el token sea válido y el usuario sea admin o superadmin
        try {
          const response = await apiBackend.get('/auth/me');
          const userData = response.data?.data;

          if (!userData || (userData.rol !== 'admin' && userData.rol !== 'superadmin')) {
            // Si no es admin ni superadmin, limpiar y redirigir según el rol
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            
            if (userData?.rol === 'usuario') {
              router.push('/sports');
            } else {
              router.push('/login');
            }
            return;
          }

          // Si es superadmin, redirigir al panel de superadmin
          if (userData.rol === 'superadmin') {
            router.push('/superadmin');
            return;
          }

          // Actualizar datos del usuario en localStorage
          localStorage.setItem('userData', JSON.stringify(userData));
        } catch (error) {
          // Si hay error con el token, limpiar y redirigir al login
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error al verificar autenticación de admin:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return null; // No renderiza nada
};