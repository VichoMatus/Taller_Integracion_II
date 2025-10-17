'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { ForgotPasswordRequest } from '@/types/auth';
import '../../Login.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validaciones básicas
        if (!email.trim()) {
            setError('Por favor, ingresa tu email');
            return;
        }

        if (!isValidEmail(email)) {
            setError('Por favor, ingresa un email válido');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('Enviando solicitud de recuperación para:', email.trim());
            await authService.forgotPassword({
                email: email.trim()
            });
            console.log('✅ Solicitud enviada exitosamente');

            // Éxito - redirigir a reset-password con el email
            router.push(`/login/reset-password?email=${encodeURIComponent(email.trim())}`);
            
        } catch (err: any) {
            console.error('Error en recuperación de contraseña:', err);
            
            let errorMessage = 'Error al procesar la solicitud. Intenta nuevamente.';
            
            // Extraer mensaje de error más específico
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            // Mensajes más amigables para errores comunes
            if (errorMessage.includes('User not found') || errorMessage.includes('usuario no encontrado')) {
                errorMessage = 'No se encontró una cuenta con este email.';
            } else if (errorMessage.includes('Network Error') || errorMessage.includes('timeout')) {
                errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            <header style={{ backgroundColor: '#4F46E5', color: 'white', padding: '1rem', textAlign: 'center' }}>
                <h1 className="header-logo">SportHub</h1>
            </header>
            
            <div className="login-container">
                <div className="login-form">
                    <div className="login-left">
                        <h1>Recuperar Contraseña</h1>
                        <p>Ingresa tu email para recibir un código de verificación</p>
                        
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
                                placeholder="tu@email.com"
                            />
                            
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                style={{ 
                                    opacity: isLoading ? 0.6 : 1,
                                    cursor: isLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isLoading ? 'Enviando código...' : 'Enviar código de verificación'}
                            </button>
                        </form>
                        
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Link href="/login" style={{ 
                                color: '#4F46E5', 
                                textDecoration: 'none', 
                                fontSize: '14px' 
                            }}>
                                ← Volver al inicio de sesión
                            </Link>
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