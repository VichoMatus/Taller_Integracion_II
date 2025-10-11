'use client';
import Link from 'next/link';
import '../../Login.css';
import { useRegistro } from '../../../hooks/useRegistro';
import { MessageDisplay } from '../../../components/ui/MessageDisplay';
import { useState } from 'react';

export default function RegistroPage() {
  const { state, handleSubmit } = useRegistro();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Función para verificar fortaleza de contraseña
  const checkPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { strength: '', message: '' };
    
    const hasMinLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    
    const requirementsMet = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers].filter(Boolean).length;
    
    if (requirementsMet >= 3 && hasMinLength && hasUpperCase) {
      return { strength: 'strong', message: 'Contraseña segura' };
    } else if (requirementsMet >= 2 && hasMinLength) {
      return { strength: 'medium', message: 'Contraseña moderada' };
    } else {
      return { strength: 'weak', message: 'Contraseña débil' };
    }
  };

  // Función para manejar el envío del formulario con validación de contraseña
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const passwordValue = formData.get('password') as string;
    const confirmPasswordValue = formData.get('confirmPassword') as string;
    
    // Validaciones de contraseña
    if (passwordValue.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (!/[A-Z]/.test(passwordValue)) {
      alert('La contraseña debe contener al menos una letra mayúscula');
      return;
    }
    
    if (passwordValue !== confirmPasswordValue) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    handleSubmit(e);
  };

  const passwordStrength = checkPasswordStrength(password);

  // Si se muestra el mensaje de verificación...
  if (state.showVerificationMessage) {
    return (
      <div>
        <header style={{ backgroundColor: '#4F46E5', color: 'white', padding: '1rem', textAlign: 'center' }}>
          <h1 className="header-logo">SportHub</h1>
        </header>
        <div className="login-container">
          <div className="login-form registro-form" style={{ maxWidth: '500px' }}>
            <div className="login-left" style={{ width: '100%', textAlign: 'center' }}>
              <MessageDisplay 
                error={state.error}
                success={state.success}
                showVerification={state.showVerificationMessage}
              />
              <div style={{ marginTop: '20px' }}>
                <Link 
                  href="/login" 
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
                >
                  Volver al Inicio de Sesión
                </Link>
                <p>¿No recibiste el correo de verificación?</p>
                <p>Revisa tu carpeta de spam o intenta registrarte nuevamente.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header style={{ backgroundColor: '#4F46E5', color: 'white', padding: '1rem', textAlign: 'center' }}>
        <h1 className="header-logo">SportHub</h1>
      </header>
      <div className="login-container">
        <div className="login-form registro-form">
          <div className="login-left">
            <h1>Registro</h1>
            
            <MessageDisplay 
              error={state.error}
              success={state.success}
            />
            
            <form onSubmit={handleFormSubmit}>
              <label htmlFor="nombre">Nombre</label>
              <input 
                type="text" 
                id="nombre" 
                name="nombre" 
                required 
                disabled={state.isLoading}
              />
              
              <label htmlFor="apellido">Apellido</label>
              <input 
                type="text" 
                id="apellido" 
                name="apellido" 
                required 
                disabled={state.isLoading}
              />
              
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                disabled={state.isLoading}
              />

              <label htmlFor="telefono">Teléfono (opcional)</label>
              <input 
                type="tel" 
                id="telefono" 
                name="telefono" 
                placeholder="Ej: +56912345678" 
                disabled={state.isLoading}
              />
              
              <label htmlFor="password">Contraseña</label>
              <div className="password-container">
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  minLength={8}
                  required 
                  disabled={state.isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              {/* Indicador de fortaleza de contraseña */}
              {password && (
                <div className={`password-strength ${passwordStrength.strength}`}>
                  {passwordStrength.message}
                </div>
              )}
              
              <div className="password-requirements">
                La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula
              </div>
              
              <label htmlFor="confirm-password">Confirmar contraseña</label>
              <div className="password-container">
                <input 
                  type="password" 
                  id="confirm-password" 
                  name="confirmPassword" 
                  required 
                  disabled={state.isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={state.isLoading}
                style={{
                  backgroundColor: state.isLoading ? '#9ca3af' : '#4F46E5',
                  cursor: state.isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {state.isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
            
            <div className="or">o</div>
            <button className="google-btn" disabled={state.isLoading}>
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
              Continuar con Google
            </button>
            <div className="signup">
              Ya tienes una cuenta? <Link href="/login">Iniciar sesión</Link>
            </div>
          </div>
          <div className="login-right">
            <img src="/imagenes/logo_sporthub.jpg" alt="Sporthub logo" />
          </div>
        </div>
      </div>
    </div>
  );
}