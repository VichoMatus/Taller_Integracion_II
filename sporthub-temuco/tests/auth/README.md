# 🔒 Pruebas de Autenticación - Recuperación de Contraseña

Este directorio contiene páginas de prueba para testear los endpoints de autenticación del backend.

## 📁 Archivos

- `forgot-password-test.tsx` - Página completa para probar el flujo de recuperación de contraseña

## 🚀 Cómo usar las páginas de prueba

### Opción 1: Como página de Next.js

1. **Copiar el archivo a la app:**
   ```bash
   # Crear directorio para la página de prueba
   mkdir -p src/app/test-forgot-password
   
   # Copiar la página
   cp tests/auth/forgot-password-test.tsx src/app/test-forgot-password/page.tsx
   ```

2. **Acceder a la página:**
   - Ir a `http://localhost:3000/test-forgot-password`

### Opción 2: Como componente independiente

1. **Importar en cualquier página existente:**
   ```typescript
   import ForgotPasswordTest from '@/tests/auth/forgot-password-test';
   
   export default function TestPage() {
     return <ForgotPasswordTest />;
   }
   ```

## 🧪 Funcionalidades de la página de prueba

### ✅ Flujo completo de recuperación de contraseña

1. **Paso 1 - Solicitar código:**
   - Input de email
   - Botón para enviar solicitud de recuperación
   - Validación de email

2. **Paso 2 - Restablecer contraseña:**
   - Input de email (mismo del paso 1)
   - Input de código de verificación
   - Input de nueva contraseña
   - Input de confirmación de contraseña
   - Validaciones completas

### 📊 Panel de resultados en tiempo real

- **Éxito/Error:** Indicadores visuales claros
- **Timestamps:** Hora exacta de cada prueba
- **Detalles técnicos:** JSON expandible con la respuesta completa
- **Logs en consola:** Información detallada para debugging

### 🌐 Tests de conectividad

- **Status individual:** Verifica endpoints específicos
- **Status general:** Verifica todos los endpoints de auth
- **Métricas:** Tiempo de respuesta y códigos HTTP

### 🛠️ Utilidades incluidas

- **Limpiar resultados:** Resetear el panel de resultados
- **Cambio de pasos:** Alternar entre forgot/reset
- **Validaciones:** Completas para todos los inputs
- **Manejo de errores:** Captura y muestra errores detallados

## 🔧 Configuración requerida

### Variables de entorno

Asegúrate de tener configurado en `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Backend funcionando

El backend debe estar ejecutándose en el puerto configurado (por defecto 4000).

## 📝 Flujo de prueba recomendado

1. **Verificar conectividad:**
   ```
   Click en "Test Conectividad" → Verificar que todos los endpoints respondan OK
   ```

2. **Probar forgot-password:**
   ```
   Ingresa email → Click "Enviar Código" → Verificar respuesta exitosa
   ```

3. **Obtener código:**
   ```
   Revisar logs del backend o consola para obtener el código generado
   ```

4. **Probar reset-password:**
   ```
   Cambiar a paso 2 → Ingresa email, código y nueva contraseña → Click "Restablecer"
   ```

5. **Verificar resultado:**
   ```
   Confirmar que la contraseña se cambió correctamente
   ```

## 🐛 Debugging

### Problemas comunes

1. **Error de conectividad:**
   - Verificar que el backend esté ejecutándose
   - Verificar la URL en NEXT_PUBLIC_API_URL
   - Revisar CORS en el backend

2. **Token inválido:**
   - Verificar que el código sea correcto
   - Verificar que no haya expirado (tiempo configurable en backend)
   - Revisar logs del backend para ver el código generado

3. **Error de validación:**
   - Verificar formato de email
   - Verificar longitud de contraseña (min 6 caracteres)
   - Verificar que las contraseñas coincidan

### Logs útiles

- **Consola del navegador (F12):** Requests/responses completos
- **Panel de resultados:** Errores capturados y formateados
- **Backend logs:** Códigos generados y errores del servidor

## 🎯 Próximos pasos

Después de confirmar que el flujo de recuperación funciona:

1. Crear pruebas similares para login/register
2. Agregar tests automatizados con Jest
3. Integrar con el flujo real de la aplicación
4. Agregar tests de carga y performance

## 📚 Estructura de respuestas esperadas

### Forgot Password (exitoso)
```json
{
  "message": "Si el correo existe, te enviamos un código para restablecer la contraseña."
}
```

### Reset Password (exitoso)  
```json
{
  "message": "Contraseña actualizada correctamente."
}
```

### Error típico
```json
{
  "ok": false,
  "error": "El código ha expirado. Genera uno nuevo."
}
```
