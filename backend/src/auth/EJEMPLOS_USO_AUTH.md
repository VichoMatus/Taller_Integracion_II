# 📚 Guía de Uso del Sistema de Autenticación

## 🎯 Introducción

Este documento proporciona ejemplos prácticos para usar el **nuevo sistema de autenticación** de SportHub con **registro de 2 pasos** y verificación OTP.

### 🚀 **Sistema Principal: Registro de 2 Pasos**
- **Hook Recomendado**: `useRegistro` - Flujo completo integrado
- **Hook Especializado**: `useRegistroVerificacion` - Solo para verificación
- **Servicio**: `authService` con métodos `registerInit()` y `registerVerify()`

---

## 🚀 1. Sistema Principal - Registro de 2 Pasos

### Hook: `useRegistro` (Sistema Principal)

**Componente con flujo completo de 2 pasos:**

```typescript
import { useRegistro } from '@/hooks/useRegistro';

export default function RegistroModerno() {
  const {
    state,
    handleSubmitRegistro,
    handleSubmitVerification,
    clearMessages,
    resetFlow,
    resendOTP
  } = useRegistro();

  // Estado para el código OTP
  const [otpCode, setOtpCode] = useState('');

  // PASO 1: Formulario de datos
  if (state.currentStep === 'form') {
    return (
      <div className="registro-container">
        <h2>Registro - Paso 1</h2>
        
        {/* Mensajes */}
        {state.error && (
          <div className="alert alert-error">
            {state.error}
            <button onClick={clearMessages}>Cerrar</button>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmitRegistro}>
          <div className="form-group">
            <label>Nombre *</label>
            <input name="nombre" type="text" required />
          </div>
          
          <div className="form-group">
            <label>Apellido *</label>
            <input name="apellido" type="text" required />
          </div>
          
          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" required />
          </div>
          
          <div className="form-group">
            <label>Teléfono *</label>
            <input name="telefono" type="tel" placeholder="+56912345678" required />
          </div>
          
          <div className="form-group">
            <label>Contraseña *</label>
            <input name="password" type="password" minLength={6} required />
          </div>
          
          <div className="form-group">
            <label>Confirmar Contraseña *</label>
            <input name="confirmPassword" type="password" required />
          </div>

          <button type="submit" disabled={state.isLoading}>
            {state.isLoading ? 'Enviando código...' : 'Continuar'}
          </button>
        </form>
      </div>
    );
  }

  // PASO 2: Verificación OTP
  if (state.currentStep === 'verification') {
    return (
      <div className="verificacion-container">
        <h2>Verificación - Paso 2</h2>
        
        <div className="info-box">
          <p>Hemos enviado un código de 6 dígitos a:</p>
          <strong>{state.email}</strong>
        </div>

        {/* Mensajes */}
        {state.error && (
          <div className="alert alert-error">{state.error}</div>
        )}
        
        {state.success && (
          <div className="alert alert-success">{state.success}</div>
        )}

        {/* Formulario OTP */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmitVerification({ code: otpCode });
        }}>
          <div className="otp-input-group">
            <label>Código de Verificación</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="otp-input"
              required
            />
          </div>

          <div className="button-group">
            <button 
              type="submit" 
              disabled={state.isLoading || otpCode.length !== 6}
            >
              {state.isLoading ? 'Verificando...' : 'Verificar Código'}
            </button>
            
            <button 
              type="button" 
              onClick={resendOTP}
              disabled={state.isLoading}
            >
              Reenviar Código
            </button>
          </div>
        </form>

        <button onClick={resetFlow} className="link-button">
          ← Volver al formulario
        </button>
      </div>
    );
  }

  // PASO 3: Completado
  if (state.currentStep === 'completed') {
    return (
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h2>¡Registro Completado!</h2>
        <p>Tu cuenta ha sido creada y verificada exitosamente.</p>
        
        <div className="action-buttons">
          <button onClick={() => window.location.href = '/dashboard'}>
            Ir al Dashboard
          </button>
          <button onClick={resetFlow}>
            Registrar Otra Cuenta
          </button>
        </div>
      </div>
    );
  }
}
```

---

## 🔧 2. Hook Especializado para Verificación

### Hook: `useRegistroVerificacion`

**Para componentes dedicados solo a verificación:**

```typescript
import { useRegistroVerificacion } from '@/hooks/useRegistroVerificacion';

interface VerificationPageProps {
  email: string;
  actionToken: string;
}

export default function VerificationPage({ email, actionToken }: VerificationPageProps) {
  const {
    state,
    verifyCode,
    resendCode,
    clearMessages,
    canResend,
    timeUntilResend
  } = useRegistroVerificacion({
    email,
    actionToken,
    onSuccess: () => {
      console.log('¡Verificación exitosa!');
      // Redirección o acción personalizada
    },
    onError: (error) => {
      console.error('Error en verificación:', error);
    }
  });

  const [code, setCode] = useState('');

  const handleVerify = async () => {
    await verifyCode(code);
  };

  return (
    <div className="verification-page">
      <h2>Verificar tu Email</h2>
      
      <p>Código enviado a: <strong>{email}</strong></p>

      {/* Estado de verificación */}
      {state.error && (
        <div className="error">{state.error}</div>
      )}
      
      {state.success && (
        <div className="success">{state.success}</div>
      )}

      {!state.isCompleted && (
        <div className="verification-form">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Código de 6 dígitos"
            maxLength={6}
          />
          
          <button 
            onClick={handleVerify}
            disabled={state.isLoading || code.length !== 6}
          >
            {state.isLoading ? 'Verificando...' : 'Verificar'}
          </button>

          {/* Reenvío con cooldown */}
          <div className="resend-section">
            {canResend ? (
              <button onClick={resendCode} disabled={state.isLoading}>
                Reenviar Código
              </button>
            ) : (
              <p>Reenviar en {Math.ceil(timeUntilResend / 1000)} segundos</p>
            )}
            <small>Reenvíos restantes: {3 - state.resendCount}</small>
          </div>
        </div>
      )}

      {state.isCompleted && (
        <div className="completed">
          <h3>¡Verificación Completada!</h3>
          <p>Tu email ha sido verificado exitosamente.</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🛠️ 3. Uso Directo del Servicio

### AuthService - Métodos Principales (Sistema Nuevo)

```typescript
import { authService } from '@/services/authService';

// ===== SISTEMA PRINCIPAL (2 PASOS) =====

// Paso 1: Iniciar registro
const iniciarRegistro = async () => {
  try {
    const response = await authService.registerInit({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      password: 'password123',
      telefono: '+56912345678'
    });
    
    console.log('Token de acción:', response.action_token);
    console.log('Mensaje:', response.message);
    
    // Guardar token para el siguiente paso
    localStorage.setItem('registration_token', response.action_token);
    
  } catch (error) {
    console.error('Error en registro inicial:', error);
  }
};

// Paso 2: Verificar OTP
const verificarCodigo = async () => {
  try {
    const actionToken = localStorage.getItem('registration_token');
    
    const response = await authService.registerVerify({
      email: 'juan@example.com',
      code: '123456',
      action_token: actionToken!
    });
    
    console.log('Usuario autenticado:', response.usuario);
    console.log('Token de sesión:', response.token);
    
    // Limpiar token temporal
    localStorage.removeItem('registration_token');
    
  } catch (error) {
    console.error('Error en verificación:', error);
  }
};

// ===== OTROS MÉTODOS DE AUTENTICACIÓN =====

// Login
const login = async () => {
  try {
    const response = await authService.login({
      email: 'usuario@example.com',
      contrasena: 'password123'
    });
    
    console.log('Login exitoso:', response);
    
  } catch (error) {
    console.error('Error en login:', error);
  }
};

// Obtener perfil actual
const obtenerPerfil = async () => {
  try {
    const perfil = await authService.me();
    console.log('Perfil actual:', perfil);
    
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
  }
};

// Verificar si está autenticado
const verificarAutenticacion = () => {
  const isAuth = authService.isAuthenticated();
  console.log('¿Está autenticado?', isAuth);
  
  const token = authService.getToken();
  console.log('Token actual:', token);
};

// Cerrar sesión
const logout = async () => {
  try {
    await authService.logout();
    console.log('Sesión cerrada');
    
  } catch (error) {
    console.error('Error cerrando sesión:', error);
  }
};

// Actualizar perfil
const actualizarPerfil = async () => {
  try {
    await authService.updateProfile({
      nombre: 'Juan Carlos',
      apellido: 'Pérez García',
      telefono: '+56912345679'
    });
    console.log('Perfil actualizado');
    
  } catch (error) {
    console.error('Error actualizando perfil:', error);
  }
};

// Cambiar contraseña
const cambiarPassword = async () => {
  try {
    await authService.changePassword({
      current_password: 'password123',
      new_password: 'newpassword456'
    });
    console.log('Contraseña cambiada');
    
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
  }
};
```

---

## 💡 4. Ejemplo de Integración Completa

### Componente de Registro Completo

```typescript
import React, { useState } from 'react';
import { useRegistro } from '@/hooks/useRegistro';

export default function RegistroCompleto() {
  const {
    state,
    handleSubmitRegistro,
    handleSubmitVerification,
    clearMessages,
    resetFlow,
    resendOTP
  } = useRegistro();

  const [otpCode, setOtpCode] = useState('');

  // Renderizado condicional según el paso actual
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'form':
        return <FormularioRegistro />;
      case 'verification':
        return <VerificacionOTP />;
      case 'completed':
        return <RegistroCompletado />;
      default:
        return <FormularioRegistro />;
    }
  };

  // Componente del formulario inicial
  const FormularioRegistro = () => (
    <div className="registro-form">
      <h2>Crear Nueva Cuenta</h2>
      
      {state.error && (
        <div className="error-alert">
          {state.error}
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmitRegistro}>
        <div className="form-grid">
          <input
            name="nombre"
            type="text"
            placeholder="Nombre"
            required
            disabled={state.isLoading}
          />
          
          <input
            name="apellido"
            type="text"
            placeholder="Apellido"
            required
            disabled={state.isLoading}
          />
          
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            required
            disabled={state.isLoading}
          />
          
          <input
            name="telefono"
            type="tel"
            placeholder="+56912345678"
            required
            disabled={state.isLoading}
          />
          
          <input
            name="password"
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            minLength={6}
            required
            disabled={state.isLoading}
          />
          
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            required
            disabled={state.isLoading}
          />
        </div>

        <button 
          type="submit" 
          disabled={state.isLoading}
          className="submit-button"
        >
          {state.isLoading ? 'Enviando código...' : 'Continuar'}
        </button>
      </form>
    </div>
  );

  // Componente de verificación OTP
  const VerificacionOTP = () => (
    <div className="verification-form">
      <h2>Verificar tu Email</h2>
      
      <div className="info-message">
        <p>Hemos enviado un código de 6 dígitos a:</p>
        <strong>{state.email}</strong>
      </div>

      {state.error && (
        <div className="error-alert">{state.error}</div>
      )}
      
      {state.success && (
        <div className="success-alert">{state.success}</div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmitVerification({ code: otpCode });
      }}>
        <div className="otp-input-container">
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="otp-input"
            required
            disabled={state.isLoading}
          />
        </div>

        <div className="button-group">
          <button 
            type="submit" 
            disabled={state.isLoading || otpCode.length !== 6}
          >
            {state.isLoading ? 'Verificando...' : 'Verificar Código'}
          </button>
          
          <button 
            type="button" 
            onClick={resendOTP}
            disabled={state.isLoading}
            className="secondary-button"
          >
            Reenviar Código
          </button>
        </div>
      </form>

      <button onClick={resetFlow} className="link-button">
        ← Volver al formulario
      </button>
    </div>
  );

  // Componente de registro completado
  const RegistroCompletado = () => (
    <div className="success-form">
      <div className="success-icon">✅</div>
      <h2>¡Bienvenido a SportHub!</h2>
      <p>Tu cuenta ha sido creada y verificada exitosamente.</p>
      
      <div className="action-buttons">
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="primary-button"
        >
          Ir al Dashboard
        </button>
        
        <button 
          onClick={resetFlow}
          className="secondary-button"
        >
          Crear Otra Cuenta
        </button>
      </div>
    </div>
  );

  return (
    <div className="registro-container">
      {/* Indicador de progreso */}
      <div className="progress-indicator">
        <div className={`step ${state.currentStep === 'form' ? 'active' : state.currentStep !== 'form' ? 'completed' : ''}`}>
          <span>1</span>
          <label>Datos</label>
        </div>
        <div className={`step ${state.currentStep === 'verification' ? 'active' : state.currentStep === 'completed' ? 'completed' : ''}`}>
          <span>2</span>
          <label>Verificación</label>
        </div>
        <div className={`step ${state.currentStep === 'completed' ? 'active' : ''}`}>
          <span>3</span>
          <label>Completado</label>
        </div>
      </div>

      {/* Renderizar paso actual */}
      {renderCurrentStep()}
    </div>
  );
}
```

---

## 📋 5. Lista de Verificación para Desarrolladores

### ✅ **Implementación Básica (Sistema Nuevo)**
- [ ] Hook `useRegistro` importado correctamente
- [ ] Formulario con todos los campos requeridos (incluye teléfono obligatorio)
- [ ] Manejo de estados para los 3 pasos del flujo
- [ ] Validación de campos antes del envío
- [ ] Componente de verificación OTP integrado

### ✅ **Implementación Avanzada (2 Pasos)**
- [ ] Lógica condicional para cada paso del flujo
- [ ] Indicador visual de progreso
- [ ] Funcionalidad de reenvío de código
- [ ] Navegación entre pasos
- [ ] Manejo de errores específicos por paso

### ✅ **Testing**
- [ ] Probar registro exitoso completo
- [ ] Probar validación de errores
- [ ] Probar reenvío de códigos
- [ ] Probar navegación entre pasos
- [ ] Probar casos edge (códigos inválidos, tokens expirados)

### ✅ **UX/UI**
- [ ] Mensajes de error claros y útiles
- [ ] Feedback visual durante loading
- [ ] Progreso visible en flujo de 2 pasos
- [ ] Responsive design
- [ ] Accesibilidad (labels, focus states)

---

## 🆘 6. Solución de Problemas Comunes

### **Error: "action_token inválido"**
```typescript
// Verificar que el token no haya expirado
// Los tokens tienen validez de 10 minutos
const checkTokenValidity = () => {
  const token = localStorage.getItem('registration_token');
  if (!token) {
    console.error('Token no encontrado - reiniciar proceso');
    // Redirigir al paso 1
  }
};
```

### **Código OTP no válido**
```typescript
// Validar formato antes de enviar
const validateOTP = (code: string) => {
  if (!/^\d{6}$/.test(code)) {
    setError('El código debe tener exactamente 6 dígitos');
    return false;
  }
  return true;
};
```

### **Teléfono no válido**
```typescript
// El nuevo sistema requiere teléfono en formato internacional
const validatePhone = (phone: string) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    setError('Formato de teléfono inválido. Ejemplo: +56912345678');
    return false;
  }
  return true;
};
```

---

**📄 Documentación generada para SportHub Auth System v2.0**  
**🗓️ Actualizado:** Octubre 2025  
**🔧 Versión:** 2.0 - Sistema Principal de 2 Pasos con OTP