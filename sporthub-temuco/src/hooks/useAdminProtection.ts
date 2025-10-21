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

        // Verificar que el token sea válido y el usuario sea admin o super_admin
        try {
          console.log('🔍 [useAdminProtection] Validando token con /auth/me...');
          const response = await apiBackend.get('/auth/me');
          
          // IMPORTANTE: El interceptor de axios ya extrajo los datos del BFF
          // La respuesta ya viene procesada, por lo que response.data es directamente el UserPublic
          const userData = response.data;
          
          console.log('✅ [useAdminProtection] Datos de usuario obtenidos:', {
            email: userData?.email,
            rol: userData?.rol,
            rolTipo: typeof userData?.rol,
            rolLength: userData?.rol?.length,
            rolCharCodes: userData?.rol?.split('').map((c: string) => c.charCodeAt(0)),
            nombre: userData?.nombre,
            id: userData?.id_usuario
          });
          
          // Si no hay datos de usuario, token inválido
          if (!userData) {
            console.log('⚠️ [useAdminProtection] No se obtuvieron datos de usuario');
            throw new Error('Token inválido o expirado');
          }

          // 🔥 NORMALIZAR ROL: Convertir super_admin a super_admin
          let normalizedRole = 'usuario'; // default
          
          if (userData.rol) {
            // Limpiar espacios y convertir a minúsculas
            const rolLower = userData.rol.toString().trim().toLowerCase();
            
            console.log('🔍 [useAdminProtection] Normalizando rol:', {
              original: userData.rol,
              trimmed: userData.rol.toString().trim(),
              lowercase: rolLower
            });
            
            if (rolLower === 'super_admin' || rolLower === 'super_admin') {
              normalizedRole = 'super_admin';
            } else if (rolLower === 'admin') {
              normalizedRole = 'admin';
            } else if (rolLower === 'usuario') {
              normalizedRole = 'usuario';
            } else {
              console.warn('⚠️ [useAdminProtection] Rol desconocido:', rolLower);
            }
          }
          
          console.log('🔍 [useAdminProtection] Verificando permisos de acceso:', {
            email: userData?.email,
            rolRecibido: userData?.rol,
            rolRecibiloLowerCase: userData?.rol?.toLowerCase(),
            rolNormalizado: normalizedRole,
            rutaActual: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
          });

          // ✅ VERIFICACIÓN DE ROL ACTIVADA
          // 🔥 ACTUALIZADO: Ya no hay super_admin en la API, todos son admin
          // Permitir acceso solo a usuarios con rol 'admin' o 'super_admin' (legacy)
          if (!userData || (normalizedRole !== 'admin' && normalizedRole !== 'super_admin')) {
            console.log('❌ [useAdminProtection] Acceso denegado:', {
              motivo: !userData ? 'Sin datos de usuario' : 'Rol insuficiente',
              email: userData?.email,
              rolRecibido: userData?.rol,
              rolNormalizado: normalizedRole,
              rolesPermitidos: ['admin', 'super_admin'],
              nota: 'En la API actual todos los super_admin se convirtieron en admin'
            });
            // Si no es admin ni super_admin, limpiar y redirigir según el rol
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('userData');
            localStorage.removeItem('user_role');
            
            if (normalizedRole === 'usuario') {
              router.push('/sports');
            } else {
              router.push('/login');
            }
            isCheckingRef.current = false;
            hasCheckedRef.current = true;
            return;
          }

          // 🔥 SIN REDIRECCIÓN: Admins pueden acceder a /admin sin ser redirigidos
          // Ya no hay distinción entre admin y super_admin en la API
          console.log('✅ [useAdminProtection] Admin - Acceso permitido:', {
            email: userData.email,
            rol: userData.rol,
            rolNormalizado: normalizedRole,
            rutaActual: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
            nota: 'Usuario admin puede acceder a /admin y /super_admin'
          });

          console.log('✅ [useAdminProtection] Acceso autorizado:', {
            email: userData.email,
            rol: userData.rol,
            rolNormalizado: normalizedRole,
            nombre: userData.nombre
          });
          
          // 🔥 IMPORTANTE: Actualizar datos del usuario con ROL NORMALIZADO en localStorage
          const normalizedUserData = {
            ...userData,
            rol: normalizedRole // ← Usar el rol normalizado, no el original
          };
          
          localStorage.setItem('userData', JSON.stringify(normalizedUserData));
          localStorage.setItem('user_role', normalizedRole); // ← Guardar también el rol normalizado
          
          console.log('💾 [useAdminProtection] Datos guardados en localStorage:', {
            rolOriginal: userData.rol,
            rolNormalizado: normalizedRole,
            userDataGuardado: normalizedUserData
          });
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