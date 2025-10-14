# 🧪 Testing Scripts - Admin & SuperAdmin Protection

## 🎯 Scripts de Prueba Automatizados

### PowerShell Testing Script

```powershell
# ===============================================
# SCRIPT DE TESTING COMPLETO - ADMIN PROTECTION
# ===============================================

Write-Host "🚀 Iniciando testing de protección Admin/SuperAdmin..." -ForegroundColor Green

# Función helper para testing
function Test-LoginAndRole {
    param(
        [string]$email,
        [string]$password,
        [string]$expectedRole
    )
    
    Write-Host "🔍 Testing login: $email" -ForegroundColor Yellow
    
    try {
        # Login
        $loginResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body "{`"email`": `"$email`", `"password`": `"$password`"}" -ErrorAction Stop
        
        $loginData = $loginResponse.Content | ConvertFrom-Json
        $token = $loginData.data.access_token
        
        Write-Host "✅ Login exitoso - Token obtenido" -ForegroundColor Green
        
        # Verificar rol
        $meResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/me" -Headers @{"Authorization"="Bearer $token"} -ErrorAction Stop
        $userData = ($meResponse.Content | ConvertFrom-Json).data
        
        Write-Host "📋 Usuario: $($userData.nombre) | Rol: $($userData.rol)" -ForegroundColor Cyan
        
        if ($userData.rol -eq $expectedRole) {
            Write-Host "✅ Rol correcto: $($userData.rol)" -ForegroundColor Green
            return @{
                success = $true
                token = $token
                userData = $userData
            }
        } else {
            Write-Host "❌ Rol incorrecto. Esperado: $expectedRole, Obtenido: $($userData.rol)" -ForegroundColor Red
            return @{success = $false}
        }
        
    } catch {
        Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
        return @{success = $false}
    }
}

# Función para testing de endpoints
function Test-EndpointAccess {
    param(
        [string]$url,
        [string]$token,
        [string]$expectedStatus = "200"
    )
    
    try {
        if ($token) {
            $response = Invoke-WebRequest -Uri $url -Headers @{"Authorization"="Bearer $token"} -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $url -ErrorAction Stop
        }
        
        Write-Host "✅ $url - Status: $($response.StatusCode)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $url - Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# ===============================================
# TESTING DE USUARIOS CONOCIDOS
# ===============================================

Write-Host "`n📋 1. Testing usuarios conocidos..." -ForegroundColor Blue

# Admin conocido
$adminTest = Test-LoginAndRole -email "dueno.cancha@gmail.com" -password "12345678" -expectedRole "admin"

if ($adminTest.success) {
    Write-Host "✅ Admin confirmado funcionando" -ForegroundColor Green
    $adminToken = $adminTest.token
} else {
    Write-Host "❌ Admin no funciona - revisar configuración" -ForegroundColor Red
    exit 1
}

# ===============================================
# TESTING DE ENDPOINTS SIN TOKEN
# ===============================================

Write-Host "`n📋 2. Testing acceso sin token..." -ForegroundColor Blue

$endpointsToTest = @(
    "http://localhost:3000/admin",
    "http://localhost:3000/superadmin"
)

foreach ($endpoint in $endpointsToTest) {
    Write-Host "🔍 Testing: $endpoint (sin token)"
    Test-EndpointAccess -url $endpoint
}

# ===============================================
# TESTING DE BACKEND ENDPOINTS
# ===============================================

Write-Host "`n📋 3. Testing backend endpoints..." -ForegroundColor Blue

# Health check
Test-EndpointAccess -url "http://localhost:4000/health"

# Auth endpoints con token admin
if ($adminToken) {
    Test-EndpointAccess -url "http://localhost:4000/api/auth/me" -token $adminToken
}

# ===============================================
# TESTING MANUAL GUIDE
# ===============================================

Write-Host "`n📋 4. Testing manual recomendado:" -ForegroundColor Blue
Write-Host "   1. Ir a http://localhost:3000/login" -ForegroundColor White
Write-Host "   2. Login con: dueno.cancha@gmail.com / 12345678" -ForegroundColor White
Write-Host "   3. Verificar redirección a /admin" -ForegroundColor White
Write-Host "   4. Verificar que CSS se carga correctamente" -ForegroundColor White
Write-Host "   5. Intentar acceder a /superadmin (debe redirigir a /superadmin si es super_admin, o mantenerse en admin si es admin)" -ForegroundColor White

# ===============================================
# RESUMEN
# ===============================================

Write-Host "`n📊 RESUMEN DE TESTING:" -ForegroundColor Green
Write-Host "✅ Sistema Admin: FUNCIONANDO" -ForegroundColor Green
Write-Host "🔄 Sistema SuperAdmin: PENDIENTE DE IMPLEMENTACIÓN" -ForegroundColor Yellow
Write-Host "📝 Logs detallados disponibles en consola del navegador" -ForegroundColor Cyan

Write-Host "`n🚀 Testing completado!" -ForegroundColor Green
```

---

## 🔍 Testing Checklist Manual

### ✅ Pre-Testing Setup
- [ ] Contenedores Docker corriendo (`docker-compose ps`)
- [ ] Backend respondiendo (`http://localhost:4000/health`)
- [ ] Frontend compilado sin errores

### ✅ Admin Testing
- [ ] Login con `dueno.cancha@gmail.com` / `12345678` funciona
- [ ] Redirección automática a `/admin` 
- [ ] CSS del admin se carga correctamente
- [ ] Dashboard muestra cards y estilos apropiados
- [ ] Sidebar funciona correctamente
- [ ] Logout y limpieza de tokens funciona

### 🔄 SuperAdmin Testing (Post-Implementation)
- [ ] Hook `useSuperAdminProtection` creado
- [ ] Layout superadmin actualizado con protección
- [ ] CSS se carga desde admin/dashboard.css
- [ ] Usuario super_admin puede acceder a `/superadmin`
- [ ] Usuario admin es redirigido desde `/superadmin` a `/admin`
- [ ] Logs de consola muestran `[useSuperAdminProtection]`

### ⚠️ Edge Cases Testing
- [ ] Acceso sin token → Redirige a `/login`
- [ ] Token inválido/expirado → Redirige a `/login` 
- [ ] Usuario rol 'usuario' → Redirige a `/sports`
- [ ] Navegación directa a URLs protegidas → Protección funciona
- [ ] Refresh de página → Mantiene protección

---

## 📊 Expected Results Matrix

| Usuario Rol | Acceso `/admin` | Acceso `/superadmin` |
|-------------|-----------------|----------------------|
| Sin token   | → `/login`      | → `/login`           |
| `usuario`   | → `/sports`     | → `/sports`          |
| `admin`     | ✅ Permitido    | → `/admin`           |
| `super_admin` | → `/superadmin` | ✅ Permitido         |

---

## 🐛 Debugging Quick Commands

```powershell
# Ver logs de frontend en tiempo real
docker-compose logs -f frontend

# Ver logs de backend
docker-compose logs -f backend

# Rebuild sin cache
docker-compose build frontend --no-cache

# Reiniciar todo el stack
docker-compose down && docker-compose up -d

# Health check rápido
curl http://localhost:4000/health

# Test de login directo
$response = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "dueno.cancha@gmail.com", "password": "12345678"}'
$response.Content
```

---

## 📝 Log Patterns to Look For

### ✅ Success Patterns:
```
🔍 [useAdminProtection] Iniciando verificación...
✅ [useAdminProtection] Datos de usuario obtenidos: { email: "...", rol: "admin" }
✅ [useAdminProtection] Acceso autorizado para admin
```

### ❌ Error Patterns:
```
❌ [useAdminProtection] Acceso denegado: Rol insuficiente
❌ [useAdminProtection] Sin token, redirigiendo al login
🔄 [useAdminProtection] Super admin detectado, redirigiendo a /superadmin
```

### 🔄 SuperAdmin Patterns (Post-Implementation):
```
🔍 [useSuperAdminProtection] Iniciando verificación...
✅ [useSuperAdminProtection] Acceso autorizado para super admin
❌ [useSuperAdminProtection] Acceso denegado: Rol insuficiente
```

---

## 🎯 Performance Benchmarks

### Expected Load Times:
- **Login page:** < 2s
- **Admin dashboard (first load):** < 5s  
- **Admin dashboard (cached):** < 1s
- **API /auth/me response:** < 500ms

### CSS Load Verification:
- Cards should have rounded corners and shadows
- Headers should use correct typography
- Sidebar should have glassmorphism effect
- Colors should match design system

---

*Usar este script antes y después de implementar SuperAdmin para validar que todo funciona correctamente.*