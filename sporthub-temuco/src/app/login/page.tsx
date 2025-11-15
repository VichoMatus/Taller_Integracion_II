'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import '../Login.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validaciones básicas
        if (!email.trim() || !password.trim()) {
            setError('Por favor, completa todos los campos');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await authService.login({
                email: email.trim(),
                contrasena: password
            });

            // Login exitoso - redireccionar según el rol
            console.log('Login exitoso:', response);
            console.log('Rol del usuario:', response.usuario?.rol);
            
            if (response.usuario && response.usuario.rol) {
                console.log('Switch con rol:', response.usuario.rol);
                switch (response.usuario.rol) {
                    case 'admin':
                        console.log('Redirigiendo a /admin');
                        router.push('/admin');
                        break;
                    case 'super_admin':
                        console.log('Redirigiendo a /super_admin');
                        router.push('/super_admin');
                        break;
                    default:
                        console.log('Redirigiendo a /sports por default');
                        router.push('/sports');
                        break;
                }
            } else {
                // Fallback si no hay rol definido
                router.push('/sports');
            }
        } catch (err: any) {
            console.error('Error en login:', err);
            setError(err.message || 'Error de conexión. Verifica tus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            <header style={{ backgroundColor: '#4F46E5', color: 'white', padding: '1rem', textAlign: 'center' }}>
                <h1 className="header-logo">SportHub</h1>
            </header>
            
            <div className="login-container">
                <div className="login-form">
                    <div className="login-left">
                        <h1>Inicio Sesión</h1>
                        <p>Inicie sesión para continuar con su cuenta</p>
                        
                        {error && (
                            <div style={{ 
                                backgroundColor: '#fee2e2', 
                                border: '1px solid #fecaca', 
                                color: '#dc2626', 
                                padding: '0.75rem', 
                                borderRadius: '0.5rem', 
                                marginBottom: '1rem' 
                            }}>
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                            
                            <label htmlFor="password">Contraseña</label>
                            <div className="password-container">
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="forgot-password" style={{ textAlign: 'center', marginTop: '15px' }}>
                                <Link href="/login/forgot-password" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px' }}>
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                style={{ 
                                    opacity: isLoading ? 0.6 : 1,
                                    cursor: isLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                            </button>
                        </form>
                        
                        <div className="or">o</div>
                        
                        <button className="google-btn" disabled={isLoading}>
                            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
                            Iniciar sesión con Google
                        </button>
                        
                        <div className="signup">
                            No tienes una cuenta? <Link href="/login/registro">Crea una</Link>
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