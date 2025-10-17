# 🧪 Página de Prueba: Registro de 2 Pasos

## 📍 Ubicación
**URL:** `/test-registro`  
**Archivo:** `src/app/test-registro/page.tsx`

## 🎯 Propósito

Esta página ha sido creada específicamente para **testear y validar** el nuevo sistema de registro de 2 pasos implementado. Permite a los desarrolladores y testers probar todas las funcionalidades del flujo de registro sin afectar el entorno de producción.

## 🚀 Funcionalidades

### ✅ **Flujo de Registro Completo**

#### Paso 1: Formulario de Registro
- ✅ Formulario con validación completa
- ✅ Botón "Llenar datos de prueba" para testing rápido
- ✅ Validación de campos requeridos
- ✅ Feedback visual en tiempo real

#### Paso 2: Verificación OTP
- ✅ Input especializado para código de 6 dígitos
- ✅ Validación automática de formato
- ✅ Botón de reenvío de código
- ✅ Opción para volver al paso anterior

#### Paso 3: Confirmación
- ✅ Pantalla de éxito con redirección automática
- ✅ Opción para probar nuevo registro
- ✅ Redirección al dashboard

### 🔧 **Panel de Debug Avanzado**

El panel de debug flotante (icono 🔧) incluye:

#### **Monitor de Estado**
- Estado actual del flujo (form/verification/completed)
- Status de loading
- Información del email y token
- Estado de autenticación

#### **Simulador de OTP**
- Generador de códigos aleatorios
- Input manual de códigos de prueba
- Botón para aplicar código directamente

#### **Controles de Navegación**
- Botones para saltar entre pasos
- Reset del flujo completo
- Limpieza de localStorage

#### **Monitor de Storage**
- Estado de tokens en localStorage
- Limpieza rápida de storage
- Información de sesión actual

#### **Sistema de Logs**
- Captura automática de logs de registro
- Filtrado de mensajes relevantes
- Limpieza manual de logs

## 🎨 **Interfaz de Usuario**

### **Indicador de Progreso**
- Círculos de progreso visual
- Estados: activo (azul), completado (verde), pendiente (gris)
- Descripción textual del paso actual

### **Sistema de Mensajes**
- Mensajes de error (rojo) con opción de cerrar
- Mensajes de éxito (verde) con feedback positivo
- Mensajes informativos contextuales

### **Estilos Responsivos**
- Diseño optimizado para desktop y mobile
- Formularios accesibles con focus states
- Botones con estados disabled apropiados

## 🧪 **Casos de Prueba Sugeridos**

### **1. Flujo Exitoso Completo**
```
1. Hacer clic en "Llenar datos de prueba"
2. Enviar formulario de registro
3. Verificar que se muestra la pantalla de OTP
4. Ingresar código válido (usar simulador)
5. Verificar redirección al dashboard
```

### **2. Validación de Errores**
```
1. Enviar formulario vacío → Ver errores de validación
2. Usar email inválido → Ver error de formato
3. Contraseñas no coinciden → Ver error específico
4. Código OTP inválido → Ver mensaje de error
```

### **3. Funciones de Reenvío**
```
1. Completar registro inicial
2. En pantalla OTP, hacer clic en "Reenviar"
3. Verificar mensaje de confirmación
4. Probar límites de reenvío
```

### **4. Navegación y Reset**
```
1. Usar panel debug para saltar entre pasos
2. Probar botón "Volver al formulario"
3. Usar "Reset del flujo" en cualquier momento
```

## 🔍 **Debug y Troubleshooting**

### **Problemas Comunes**

#### **Error: "action_token inválido"**
- **Causa**: Token expirado o malformado
- **Solución**: Reiniciar el flujo desde el paso 1

#### **Error: "Código OTP inválido"**
- **Causa**: Código incorrecto o expirado
- **Solución**: Usar simulador de OTP o reenviar código

#### **Error de conexión**
- **Causa**: Backend no disponible
- **Solución**: Verificar que el servidor esté corriendo

### **Información de Debug Útil**

```javascript
// Estado completo del hook
console.log(state);

// Verificar localStorage
console.log({
  token: localStorage.getItem('token'),
  access_token: localStorage.getItem('access_token')
});

// Simular OTP desde consola
handleSimulateOTP('123456');
```

## 📋 **Lista de Verificación**

Antes de considerar que el sistema funciona correctamente, verificar:

- [ ] ✅ Formulario de registro valida todos los campos
- [ ] ✅ Se envía OTP al email proporcionado
- [ ] ✅ Pantalla de verificación se muestra correctamente
- [ ] ✅ Códigos OTP válidos completan el registro
- [ ] ✅ Códigos inválidos muestran errores apropiados
- [ ] ✅ Función de reenvío funciona con límites
- [ ] ✅ Navegación entre pasos es fluida
- [ ] ✅ Redirección final funciona correctamente
- [ ] ✅ Tokens se guardan en localStorage
- [ ] ✅ Panel de debug muestra información correcta

## 🔧 **Configuración del Backend**

Para que las pruebas funcionen correctamente, asegúrate de que:

1. **Backend está corriendo** en el puerto configurado
2. **Endpoints están disponibles**:
   - `POST /auth/register/init`
   - `POST /auth/register/verify`
3. **CORS está configurado** para el frontend
4. **Base de datos está conectada** y funcionando

## 🚀 **Próximos Pasos**

Una vez que todas las pruebas pasen exitosamente:

1. **Integrar en componentes de producción**
2. **Actualizar tests automatizados**
3. **Documentar APIs para el equipo**
4. **Configurar monitoring en producción**

## 📞 **Soporte**

Si encuentras problemas durante las pruebas:

1. **Revisa los logs** en el panel de debug
2. **Verifica la consola** del navegador
3. **Checa el estado del backend** 
4. **Reinicia el flujo** usando el panel de debug

---

**⚠️ Importante:** Esta página es solo para desarrollo y testing. **No debe ser accesible en producción.**