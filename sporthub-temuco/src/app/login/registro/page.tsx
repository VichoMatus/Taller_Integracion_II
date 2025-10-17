'use client';
import Link from 'next/link';
import '../../Login.css';
import { useRegistroLegacy } from '../../../hooks/useRegistroLegacy';
import { MessageDisplay } from '../../../components/ui/MessageDisplay';

export default function RegistroPage() {
  const { state, handleSubmit } = useRegistroLegacy();

  // Si se muestra el mensaje de verificación, mostrar solo ese mensaje
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
            
            {/* Mostrar mensajes de error/éxito */}
            <MessageDisplay 
              error={state.error}
              success={state.success}
            />
            
            <form onSubmit={handleSubmit}>
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
                  minLength={6} 
                  required 
                  disabled={state.isLoading}
                />
              </div>
              
              <label htmlFor="confirm-password">Confirmar contraseña</label>
              <div className="password-container">
                <input 
                  type="password" 
                  id="confirm-password" 
                  name="confirmPassword" 
                  required 
                  disabled={state.isLoading}
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