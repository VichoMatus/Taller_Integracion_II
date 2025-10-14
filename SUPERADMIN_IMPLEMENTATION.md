# 🔧 Implementación SuperAdmin - Pasos Exactos

## 🎯 Resumen Ejecutivo
Esta guía te permitirá implementar la protección de SuperAdmin en **~15 minutos** siguiendo los mismos patrones exitosos del Admin.

---

## 📋 Checklist de Implementación

### ✅ Paso 1: Crear Hook de Protección SuperAdmin

**Archivo:** `src/hooks/useSuperAdminProtection.ts`

```bash
# Copiar el hook existente como base
cp src/hooks/useAdminProtection.ts src/hooks/useSuperAdminProtection.ts
```

**Modificaciones necesarias:**

1. **Cambiar nombre de función:**
   ```typescript
   // ANTES
   export const useAdminProtection = () => {
   
   // DESPUÉS  
   export const useSuperAdminProtection = () => {
   ```

2. **Actualizar logs y comentarios:**
   ```typescript
   // ANTES
   console.log('🔍 [useAdminProtection] Iniciando verificación...');
   
   // DESPUÉS
   console.log('🔍 [useSuperAdminProtection] Iniciando verificación...');
   ```

3. **Cambiar lógica de roles:**
   ```typescript
   // ANTES - Admin acepta admin y super_admin
   if (!userData || (userData.rol !== 'admin' && userData.rol !== 'super_admin')) {
   
   // DESPUÉS - SuperAdmin SOLO acepta super_admin
   if (!userData || userData.rol !== 'super_admin') {
   ```

4. **Actualizar redirecciones:**
   ```typescript
   // DESPUÉS de la verificación de rol
   if (userData?.rol === 'admin') {
     router.push('/admin');
   } else if (userData?.rol === 'usuario') {
     router.push('/sports');  
   } else {
     router.push('/login');
   }
   ```

### ✅ Paso 2: Actualizar Layout SuperAdmin

**Archivo:** `src/app/superadmin/layout.tsx`

**Cambios exactos:**

1. **Agregar importaciones:**
   ```typescript
   import { useSuperAdminProtection } from '@/hooks/useSuperAdminProtection';
   import '../admin/dashboard.css'; // Reutilizar CSS
   ```

2. **Aplicar protección:**
   ```typescript
   export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
     const [userName, setUserName] = useState('Super Administrador');
     
     // AGREGAR ESTA LÍNEA
     useSuperAdminProtection();
     
     // ... resto del componente
   }
   ```

3. **Configurar props correctas:**
   ```typescript
   return (
     <AdminsLayout 
       userRole="superadmin"  // ← IMPORTANTE: debe ser exactamente "superadmin"
       userName={userName}
       notificationCount={5}
     >
       {children}
     </AdminsLayout>
   );
   ```

### ✅ Paso 3: Verificar Páginas SuperAdmin

**Archivos:** `src/app/superadmin/page.tsx` y otras páginas

**Asegurar que usen clases CSS correctas:**

```typescript
export default function SuperAdminDashboard() {
  return (
    <div className="admin-dashboard-container"> {/* ← Reutilizar clases del admin */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Super Administrador</h1>
        {/* ... resto del contenido */}
      </div>
    </div>
  );
}
```

---

## 🚀 Testing Rápido

### Método 1: Docker Build & Test

```bash
# 1. Rebuild frontend
docker-compose build frontend --no-cache

# 2. Reiniciar contenedor
docker-compose up frontend -d

# 3. Probar acceso
# Ir a http://localhost:3000/superadmin
```

### Método 2: Test de API

```powershell
# 1. Login con admin existente
$response = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "dueno.cancha@gmail.com", "password": "12345678"}'

# 2. Verificar redirección (admin debería ser redirigido desde /superadmin)
```

---

## ⚠️ Puntos Críticos

### 🔴 MUY IMPORTANTE:

1. **Rol exacto:** Usar `'super_admin'` (con underscore), no `'superadmin'`
2. **UserRole prop:** En AdminsLayout usar `"superadmin"` (sin underscore)
3. **CSS import:** Importar en layout, no en páginas individuales
4. **No bucles:** El hook ya tiene protección contra ejecuciones múltiples

### 📝 Diferencias Admin vs SuperAdmin:

| Aspecto | Admin | SuperAdmin |
|---------|-------|------------|
| Hook | `useAdminProtection` | `useSuperAdminProtection` |
| Roles aceptados | `admin`, `super_admin` | Solo `super_admin` |
| Redirige super_admin a | `/superadmin` | N/A (ya está ahí) |
| Redirige admin a | N/A (ya está ahí) | `/admin` |

---

## 🐛 Troubleshooting Express

### Si no funciona:

1. **Verificar logs de consola:**
   ```
   Buscar: [useSuperAdminProtection]
   Confirmar que aparecen los logs de verificación
   ```

2. **Verificar importación:**
   ```typescript
   // Debe estar en superadmin/layout.tsx
   import { useSuperAdminProtection } from '@/hooks/useSuperAdminProtection';
   ```

3. **Verificar llamada del hook:**
   ```typescript
   // Debe estar en el componente
   useSuperAdminProtection();
   ```

4. **Verificar CSS:**
   ```typescript
   // Debe estar en superadmin/layout.tsx  
   import '../admin/dashboard.css';
   ```

### Errores Comunes:

**❌ "Cannot find module useSuperAdminProtection"**  
→ El archivo no se creó o el nombre es incorrecto

**❌ "Bucle de redirección"**  
→ Verificar que el hook solo se llame una vez en el layout

**❌ "CSS no se aplica"**  
→ Verificar import del CSS en layout, no en páginas individuales

**❌ "Usuario admin puede acceder a superadmin"**  
→ Verificar la lógica de roles en el hook

---

## ✅ Validación Final

### Comportamiento esperado:

1. **Usuario sin token:** `/superadmin` → `/login` ✅
2. **Usuario normal:** `/superadmin` → `/sports` ✅  
3. **Admin:** `/superadmin` → `/admin` ✅
4. **SuperAdmin:** `/superadmin` → Queda ahí ✅
5. **SuperAdmin:** `/admin` → `/superadmin` ✅

### CSS esperado:
- Headers con estilo correcto ✅
- Cards con colores apropiados ✅
- Layout general coherente ✅
- Sidebar funcionando ✅

---

## 🎉 ¡Listo!

Si sigues estos pasos exactos, tendrás el sistema SuperAdmin funcionando igual que Admin en aproximadamente 15 minutos.

**Archivos modificados:**
- ✅ `src/hooks/useSuperAdminProtection.ts` (nuevo)
- ✅ `src/app/superadmin/layout.tsx` (modificado)
- ✅ Páginas superadmin usando clases CSS correctas (verificado)

**Para crear usuario SuperAdmin en BD:**
```sql
-- Cambiar rol de usuario existente
UPDATE usuarios SET rol = 'super_admin' WHERE email = 'EMAIL_DEL_SUPERADMIN';
```

**O seguir el patrón del admin existente para agregar usuarios con rol apropiado.**

---

*Tiempo estimado de implementación: 15 minutos*  
*Basado en: Implementación exitosa de Admin (Oct 2025)*