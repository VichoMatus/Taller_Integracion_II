// app/login/verificar/page.tsx
'use client';
import Link from 'next/link';
import '../../Login.css';
import { useState } from 'react';

export default function VerificarPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = () => {
    setIsLoading(true);
    // Simular proceso de verificación
    setTimeout(() => {
      setIsVerified(true);
      setIsLoading(false);
    }, 1500);
  };

  // Si está verificado, mostrar mensaje de éxito
  if (isVerified) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <header style={{ backgroundColor: '#4F46E5', color: 'white', padding: '1rem', textAlign: 'center' }}>
          <h1 className="header-logo">SportHub</h1>
        </header>
        
        <div className="login-container">
          <div className="login-form" style={{ maxWidth: '500px' }}>
            <div className="login-left" style={{ width: '100%', textAlign: 'center' }}>
              {/* Mensaje de verificación exitosa */}
              <div className="verification-message">
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  fontWeight: 'bold',
                  margin: '0 auto 25px auto'
                }}>
                  ✓
                </div>
                <h3>¡Cuenta Verificada!</h3>
                <p>Tu dirección de correo electrónico ha sido verificada exitosamente.</p>
                <div className="verification-note">
                  ✅ Tu cuenta ahora está completamente activa
                </div>
              </div>
              
              <div style={{ marginTop: '30px' }}>
                <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                  Ya puedes iniciar sesión en tu cuenta de SportHub
                </p>
                <Link 
                  href="/login" 
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    padding: '14px 30px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'background-color 0.3s, transform 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#4338CA';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#4F46E5';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Ir al Inicio de Sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Página inicial con botón de verificación
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <header style={{ backgroundColor: '#4F46E5', color: 'white', padding: '1rem', textAlign: 'center' }}>
        <h1 className="header-logo">SportHub</h1>
      </header>
      
      <div className="login-container">
        <div className="login-form" style={{ maxWidth: '500px' }}>
          <div className="login-left" style={{ width: '100%', textAlign: 'center' }}>
            <h1>Verificar Cuenta</h1>
            <p>Confirma tu dirección de correo electrónico</p>
            
            <div className="verification-message">
              <h3>Verificación Requerida</h3>
              <p>
                Para completar el proceso de registro, confirma que eres el propietario de esta cuenta.
              </p>
              <div className="verification-note">
                💡 Haz clic en el botón para verificar tu cuenta
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <button 
                onClick={handleVerification}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#9ca3af' : '#4F46E5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '14px 30px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s, transform 0.2s',
                  minWidth: '200px'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#4338CA';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#4F46E5';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isLoading ? 'Verificando...' : 'Verificar Cuenta'}
              </button>
            </div>

            <div className="signup" style={{ marginTop: '25px' }}>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}