/**
 * HOOK DE PROTECCIÓN PARA ADMINISTRADORES
 * ======================================
 * 
 * Este hook protege rutas que requieren permisos de administrador.
 * Solo permite acceso a usuarios con rol 'admin' o 'super_admin'.
 * 
 * FUNCIONAMIENTO:
 * 1. Verifica si existe un token en localStorage (access_token o token)
 * 2. Valida el token con el endpoint /auth/me del backend
 * 3. Comprueba que el usuario tenga rol 'admin' o 'super_admin'
 * 4. Redirige según corresponda si no cumple los requisitos
 * 
 * USUARIOS ADMIN VERIFICADOS:
 * - dueno.cancha@gmail.com (rol: admin) ✅ Funcionando
 * 
 * PARA AGREGAR MÁS ADMINS EN EL FUTURO:
 * 1. Crear usuario en la base de datos con rol 'admin'
 * 2. El hook automáticamente permitirá acceso (no requiere cambios de código)
 * 3. El sistema es escalable y no hardcodea emails específicos
 * 
 * IMPORTANTE: 
 * - El hook usa el interceptor de axios que procesa automáticamente las respuestas BFF
 * - La respuesta de /auth/me ya viene procesada como UserPublic directamente
 */

'use client';

import { useEffect, useRef } from 'react';
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
  const isCheckingRef = useRef(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Evitar múltiples ejecuciones simultáneas
    if (isCheckingRef.current || hasCheckedRef.current) {
      return;
    }

    const checkAuth = async () => {
      if (isCheckingRef.current) return;
      
      isCheckingRef.current = true;
      console.log('🔍 useAdminProtection - Iniciando verificación de autenticación...');
      try {
        // Verificar si existe un token (buscar en ambas ubicaciones posibles)
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        console.log('🔍 useAdminProtection - Token encontrado:', !!token);
        console.log('🔍 useAdminProtection - access_token:', !!localStorage.getItem('access_token'));
        console.log('🔍 useAdminProtection - token:', !!localStorage.getItem('token'));
        
        if (!token) {
          console.log('❌ useAdminProtection - No hay token, redirigiendo al login');
          isCheckingRef.current = false;
          hasCheckedRef.current = true;
          router.push('/login');
          return;
        }

        // Verificar que el token sea válido y el usuario sea admin o superadmin
        try {
          console.log('🔍 [useAdminProtection] Validando token con /auth/me...');
          const response = await apiBackend.get('/auth/me');
          
          // IMPORTANTE: El interceptor de axios ya extrajo los datos del BFF
          // La respuesta ya viene procesada, por lo que response.data es directamente el UserPublic
          const userData = response.data;
          
          console.log('✅ [useAdminProtection] Datos de usuario obtenidos:', {
            email: userData?.email,
            rol: userData?.rol,
            nombre: userData?.nombre,
            id: userData?.id_usuario
          });
          
          // Si no hay datos de usuario, token inválido
          if (!userData) {
            console.log('⚠️ [useAdminProtection] No se obtuvieron datos de usuario');
            throw new Error('Token inválido o expirado');
          }

          if (!userData || (userData.rol !== 'admin' && userData.rol !== 'super_admin')) {
            console.log('❌ [useAdminProtection] Acceso denegado:', {
              motivo: !userData ? 'Sin datos de usuario' : 'Rol insuficiente',
              email: userData?.email,
              rolRecibido: userData?.rol,
              rolesPermitidos: ['admin', 'super_admin']
            });
            // Si no es admin ni superadmin, limpiar y redirigir según el rol
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('userData');
            
            if (userData?.rol === 'usuario') {
              router.push('/sports');
            } else {
              router.push('/login');
            }
            isCheckingRef.current = false;
            hasCheckedRef.current = true;
            return;
          }

          // Si es superadmin, redirigir al panel de superadmin
          if (userData.rol === 'super_admin') {
            console.log('🔄 [useAdminProtection] Super admin detectado, redirigiendo a /superadmin:', {
              email: userData.email,
              rol: userData.rol
            });
            router.push('/superadmin');
            isCheckingRef.current = false;
            hasCheckedRef.current = true;
            return;
          }

          console.log('✅ [useAdminProtection] Acceso autorizado para admin:', {
            email: userData.email,
            rol: userData.rol,
            nombre: userData.nombre
          });
          // Actualizar datos del usuario en localStorage
          localStorage.setItem('userData', JSON.stringify(userData));
          isCheckingRef.current = false;
          hasCheckedRef.current = true;
        } catch (error: any) {
          console.warn('⚠️ useAdminProtection - Error al verificar token (esto es normal si no hay sesión activa):', error.message);
          // Si hay error con el token, limpiar y redirigir al login sin mostrar error
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('userData');
          isCheckingRef.current = false;
          hasCheckedRef.current = true;
          router.push('/login');
        }
      } catch (error) {
        console.error('Error al verificar autenticación de admin:', error);
        router.push('/login');
      } finally {
        isCheckingRef.current = false;
        hasCheckedRef.current = true;
      }
    };

    checkAuth();
  }, []); // Remover router de dependencias para evitar bucles

  return null; // No renderiza nada
};