'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { googleAuthService } from '@/services/googleAuthService';
import Script from 'next/script';
import '../Login.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);
    // Inicializar Google Sign-In cuando el script se carga
    useEffect(() => {
        if (googleScriptLoaded && typeof window !== 'undefined') {
            googleAuthService.initializeGoogleSignIn(
                // Success callback
                async (response) => {
                    try {
                        setIsLoading(true);
                        setError('');
                        
                        // response.credential contiene el id_token de Google
                        const result = await googleAuthService.loginWithGoogle(response.credential);
                        
                        console.log('✅ Login con Google exitoso:', result);
                        
                        // Verificar si hay usuario y rol
                        const user = result.user;
                        const isFallback = result.fallback;
                        
                        if (isFallback) {
                            console.warn('⚠️ Modo fallback - usando token temporal');
                            setError(result.message || '');
                        }
                        
                        // Redireccionar según rol
                        if (user && user.rol) {
                            switch (user.rol) {
                                case 'admin':
                                    router.push('/admin');
                                    break;
                                case 'super_admin':
                                    router.push('/super_admin');
                                    break;
                                default:
                                    router.push('/sports');
                                    break;
                            }
                        } else {
                            router.push('/sports');
                        }
                    } catch (err: any) {
                        console.error('❌ Error en login con Google:', err);
                        setError(err.message || 'Error al iniciar sesión con Google');
                    } finally {
                        setIsLoading(false);
                    }
                },
                // Error callback
                (errorMsg) => {
                    setError(errorMsg);
                }
            );

            // Renderizar el botón después de inicializar
            setTimeout(() => {
                googleAuthService.renderButton('googleSignInButton');
            }, 100);
        }
    }, [googleScriptLoaded, router]);

    const handleSubmit = async (e: any) => {
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
        <>
            {/* Cargar Google Identity Services */}
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={() => {
                    console.log('✅ Google Identity Services cargado');
                    setGoogleScriptLoaded(true);
                }}
                onError={() => {
                    console.error('❌ Error cargando Google Identity Services');
                    setError('Error cargando Google Sign-In');
                }}
            />
            
            <div style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden', position: 'relative' }}>
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
                                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        required
                                        style={{
                                            width: '70%',
                                            flex: '0 0 70%',
                                            borderTopRightRadius: '0',
                                            borderBottomRightRadius: '0',
                                            margin: '0',
                                            borderRight: 'none',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                        style={{
                                            width: '30%',
                                            flex: '0 0 30%',
                                            background: '#4F46E5',
                                            color: 'white',
                                            border: 'none',
                                            borderTopRightRadius: '5px',
                                            borderBottomRightRadius: '5px',
                                            borderTopLeftRadius: '0',
                                            borderBottomLeftRadius: '0',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            padding: '0',
                                            margin: '0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: isLoading ? 0.5 : 1,
                                            boxShadow: 'none',
                                            outline: 'none',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
                                        onMouseLeave={e => (e.currentTarget.style.background = '#4F46E5')}
                                    >
                                        {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    </button>
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
                            
                            {/* Contenedor para el botón de Google */}
                            <div id="googleSignInButton" style={{ width: '100%', marginBottom: '1rem' }}></div>
                            
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
        </>
    );
}