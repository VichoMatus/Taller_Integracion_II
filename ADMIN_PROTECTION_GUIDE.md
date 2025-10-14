# 🛡️ Guía de Protección de Rutas Admin/SuperAdmin

## 📋 Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Implementación Actual (Admin)](#implementación-actual-admin)
- [Cómo Implementar para SuperAdmin](#cómo-implementar-para-superadmin)
- [Estructura de Archivos](#estructura-de-archivos)
- [Casos de Uso y Testing](#casos-de-uso-y-testing)
- [Troubleshooting](#troubleshooting)

---

## 📖 Descripción General

Este proyecto implementa un sistema de **protección de rutas** basado en roles para administradores y superadministradores. El sistema verifica automáticamente:

1. ✅ **Autenticación:** Usuario tiene token válido
2. ✅ **Autorización:** Usuario tiene el rol correcto (`admin` o `super_admin`)
3. ✅ **Redirección inteligente:** Envía al usuario al lugar apropiado según su rol

### 🎯 Características principales:
- **Escalable:** Funciona con cualquier email que tenga rol admin/superadmin en la BD
- **Automático:** No requiere hardcodear emails específicos
- **Seguro:** Verifica tanto token como rol en cada acceso
- **Robusto:** Maneja errores y casos edge apropiadamente

---

## 🏗️ Arquitectura del Sistema

### Flujo de Autenticación:
```
Usuario accede a /admin → useAdminProtection Hook → Verificar token → Verificar rol → Permitir/Redirigir
```

### Componentes Principales:

1. **Hook de Protección** (`useAdminProtection.ts`)
   - Verifica autenticación y autorización
   - Maneja redirecciones automáticas
   - Previene bucles infinitos

2. **Layout Protegido** (`admin/layout.tsx`)
   - Aplica protección a todas las páginas admin
   - Carga estilos CSS centralizados
   - Maneja estado del usuario

3. **Backend API** (`/auth/me`)
   - Valida tokens JWT
   - Retorna datos del usuario incluyendo rol
   - Estructura de respuesta BFF

---

## 🛠️ Implementación Actual (Admin)

### ✅ Admin ya implementado y funcionando

**Archivos clave:**
- `src/hooks/useAdminProtection.ts` - Hook principal ✅
- `src/app/admin/layout.tsx` - Layout protegido ✅
- `src/app/admin/dashboard.css` - Estilos centralizados ✅

**Usuario de prueba:**
- Email: `dueno.cancha@gmail.com`
- Contraseña: `12345678`
- Rol: `admin`

### Funcionamiento:
1. ✅ Hook verifica token en localStorage (`access_token` o `token`)
2. ✅ Llama a `/auth/me` para validar con el backend
3. ✅ Verifica rol `admin` o `super_admin`
4. ✅ Si es `super_admin`, redirige a `/superadmin`
5. ✅ Si es `admin`, permite acceso
6. ✅ Si no está autorizado, redirige según rol del usuario

---

## 🚀 Cómo Implementar para SuperAdmin

### 📝 Paso 1: Crear Hook de Protección SuperAdmin

Crear archivo: `src/hooks/useSuperAdminProtection.ts`

```typescript
/**
 * HOOK DE PROTECCIÓN PARA SUPERADMINISTRADORES
 * ===========================================
 * 
 * Basado en useAdminProtection.ts - Mismo patrón, diferentes permisos
 * Solo permite acceso a usuarios con rol 'super_admin'
 */

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiBackend } from '@/config/backend';

interface UserData {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: string;
}

export const useSuperAdminProtection = () => {
  const router = useRouter();
  
  // Prevenir múltiples ejecuciones simultaneas
  const isCheckingRef = useRef(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Evitar ejecuciones múltiples
    if (isCheckingRef.current || hasCheckedRef.current) {
      return;
    }

    const checkSuperAdminAuth = async () => {
      isCheckingRef.current = true;
      
      console.log('🔍 [useSuperAdminProtection] Iniciando verificación...');
      
      try {
        // Verificar token
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        console.log('🔍 [useSuperAdminProtection] Token encontrado:', !!token);
        
        if (!token) {
          console.log('❌ [useSuperAdminProtection] Sin token, redirigiendo al login');
          router.push('/login');
          isCheckingRef.current = false;
          hasCheckedRef.current = true;
          return;
        }

        // Verificar rol con backend
        console.log('🔍 [useSuperAdminProtection] Validando con /auth/me...');
        const response = await apiBackend.get('/auth/me');
        
        // El interceptor ya procesó la respuesta BFF
        const userData = response.data;
        
        console.log('✅ [useSuperAdminProtection] Datos de usuario:', {
          email: userData?.email,
          rol: userData?.rol,
          nombre: userData?.nombre,
          id: userData?.id_usuario
        });

        // SOLO permitir super_admin
        if (!userData || userData.rol !== 'super_admin') {
          console.log('❌ [useSuperAdminProtection] Acceso denegado:', {
            motivo: !userData ? 'Sin datos de usuario' : 'Rol insuficiente',
            email: userData?.email,
            rolRecibido: userData?.rol,
            rolRequerido: 'super_admin'
          });
          
          // Redirigir según el rol del usuario
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('userData');
          
          if (userData?.rol === 'admin') {
            router.push('/admin');
          } else if (userData?.rol === 'usuario') {
            router.push('/sports');
          } else {
            router.push('/login');
          }
          isCheckingRef.current = false;
          hasCheckedRef.current = true;
          return;
        }

        console.log('✅ [useSuperAdminProtection] Acceso autorizado para super admin:', {
          email: userData.email,
          rol: userData.rol,
          nombre: userData.nombre
        });
        
        isCheckingRef.current = false;
        hasCheckedRef.current = true;

      } catch (error) {
        console.error('❌ [useSuperAdminProtection] Error en verificación:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        router.push('/login');
        isCheckingRef.current = false;
        hasCheckedRef.current = true;
      }
    };

    checkSuperAdminAuth();
  }, [router]);
};
```

### 📝 Paso 2: Actualizar Layout de SuperAdmin

Modificar: `src/app/superadmin/layout.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import AdminsLayout from '@/components/layout/AdminsLayout';
import { useSuperAdminProtection } from '@/hooks/useSuperAdminProtection'; // ← Importar nuevo hook
import '../admin/dashboard.css'; // ← Reutilizar CSS del admin

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState('Super Administrador');
  
  // ← APLICAR PROTECCIÓN DE SUPERADMIN
  useSuperAdminProtection();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.nombre) {
      setUserName(userData.nombre);
    }
  }, []);

  return (
    <AdminsLayout 
      userRole="superadmin"  // ← Importante: rol correcto
      userName={userName}
      notificationCount={5}  // ← Personalizable
    >
      {children}
    </AdminsLayout>
  );
}
```

### 📝 Paso 3: Verificar Páginas de SuperAdmin

Asegurarse que todas las páginas en `src/app/superadmin/` usen el layout:

```typescript
// src/app/superadmin/page.tsx
'use client';

import React from 'react';
// Importaciones necesarias...

export default function SuperAdminDashboard() {
  // ← No necesita hooks adicionales, el layout maneja la protección
  
  return (
    <div className="admin-dashboard-container"> {/* ← Reutilizar clases CSS del admin */}
      {/* Contenido del dashboard */}
    </div>
  );
}
```

---

## 📁 Estructura de Archivos

```
src/
├── hooks/
│   ├── useAdminProtection.ts          ✅ Implementado
│   └── useSuperAdminProtection.ts     🔄 Por implementar
├── app/
│   ├── admin/
│   │   ├── layout.tsx                 ✅ Protegido + CSS
│   │   ├── page.tsx                   ✅ Dashboard
│   │   └── dashboard.css              ✅ Estilos compartidos
│   └── superadmin/
│       ├── layout.tsx                 🔄 Necesita actualización
│       └── page.tsx                   🔄 Usar clases CSS admin
└── config/
    └── backend.ts                     ✅ Interceptor configurado
```

---

## 🧪 Casos de Uso y Testing

### Testing Manual:

1. **Usuario sin token:**
   ```
   Acceso: /admin o /superadmin
   Resultado: Redirige a /login
   ```

2. **Usuario normal (rol: 'usuario'):**
   ```
   Acceso: /admin o /superadmin  
   Resultado: Redirige a /sports
   ```

3. **Admin (rol: 'admin'):**
   ```
   Acceso: /admin → ✅ Permitido
   Acceso: /superadmin → ❌ Redirige a /admin
   ```

4. **SuperAdmin (rol: 'super_admin'):**
   ```
   Acceso: /admin → 🔄 Redirige a /superadmin
   Acceso: /superadmin → ✅ Permitido
   ```

### Testing con API:

```powershell
# 1. Login
$response = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "EMAIL", "password": "PASSWORD"}'

# 2. Extraer token
$token = ($response.Content | ConvertFrom-Json).data.access_token

# 3. Verificar rol
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/me" -Headers @{"Authorization"="Bearer $token"}

# 4. La respuesta debe mostrar rol: "admin" o "super_admin"
```

### Usuarios de Prueba:

**Admin confirmado:**
- Email: `dueno.cancha@gmail.com`
- Password: `12345678`
- Rol: `admin`

**Para agregar SuperAdmin:**
Crear usuario en BD con `rol = 'super_admin'`

---

## 🐛 Troubleshooting

### ❌ Problema: "Bucle de redirección infinita"
**Causa:** Hook ejecutándose múltiples veces  
**Solución:** Usar `useRef` para controlar ejecuciones (ya implementado)

### ❌ Problema: "CSS no se carga"
**Causa:** Import de CSS solo en página individual  
**Solución:** Importar CSS en `layout.tsx` (ya implementado para admin)

### ❌ Problema: "Usuario autorizado no puede acceder"
**Causa:** Interceptor de axios modifica respuesta  
**Solución:** Acceder directamente a `response.data` (ya implementado)

### ❌ Problema: "Rol no coincide"
**Causa:** Base de datos usa `super_admin`, código usa `superadmin`  
**Solución:** Usar exactamente `'super_admin'` en verificaciones

### 📊 Logs de Debugging:

Los hooks generan logs con prefijos identificables:
- `[useAdminProtection]` - Admin
- `[useSuperAdminProtection]` - SuperAdmin

Ejemplos:
```
🔍 [useAdminProtection] Iniciando verificación...
✅ [useAdminProtection] Acceso autorizado para admin
❌ [useSuperAdminProtection] Acceso denegado: Rol insuficiente
```

---

## 📋 Checklist de Implementación SuperAdmin

- [ ] Crear `useSuperAdminProtection.ts` (copiar de admin, ajustar rol)
- [ ] Actualizar `superadmin/layout.tsx` (agregar hook + CSS)
- [ ] Verificar que todas las páginas superadmin usen el layout
- [ ] Probar con usuario super_admin
- [ ] Verificar redirecciones funcionan correctamente
- [ ] Confirmar CSS se carga apropiadamente

---

## 🚀 Próximos Pasos

1. **Implementar SuperAdmin** siguiendo esta guía
2. **Crear usuarios de prueba** con rol `super_admin`
3. **Testing exhaustivo** de todos los flujos
4. **Documentar usuarios** específicos del sistema
5. **Optimizar experiencia** de usuario (loading states, etc.)

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisar logs de consola** (prefijo de hooks)
2. **Verificar estado de contenedores** (`docker-compose ps`)
3. **Probar login con API** directamente
4. **Confirmar estructura de BD** (roles exactos)
5. **Revisar interceptor de axios** (`src/config/backend.ts`)

---

**✅ Sistema Admin completamente funcional**  
**🔄 Sistema SuperAdmin listo para implementar siguiendo esta guía**

*Última actualización: 14 de octubre de 2025*