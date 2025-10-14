'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import '../../Login.css';

function ResetPasswordContent() {
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const email = searchParams.get('email');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validaciones
        if (!code || !password || !confirmPassword) {
            setError('Por favor, completa todos los campos');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!email) {
            setError('Email no encontrado. Por favor, solicita un nuevo código.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await authService.resetPassword({
                email: email,
                code: code,
                new_password: password
            });

            // Éxito - mostrar mensaje de confirmación
            setSuccess(true);
            
        } catch (err: any) {
            console.error('Error al restablecer contraseña:', err);
            setError(err.message || 'Error al restablecer la contraseña. El código puede ser incorrecto o haber expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!email && !success) {
        return (
            <div className="login-left">
                <h1>Email No Encontrado</h1>
                <p>No se pudo identificar tu email. Por favor, solicita un nuevo código de recuperación.</p>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link href="/login/forgot-password" style={{ 
                        color: '#4F46E5', 
                        textDecoration: 'none', 
                        fontWeight: '600' 
                    }}>
                        Solicitar nuevo código
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="login-left">
            <h1>Restablecer Contraseña</h1>
            <p>Ingresa el código que recibiste y tu nueva contraseña</p>
            {email && (
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                    Código enviado a: <strong>{email}</strong>
                </p>
            )}
            
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

            {success ? (
                <div className="verification-message">
                    <h3>¡Contraseña restablecida!</h3>
                    <p>Tu contraseña ha sido actualizada correctamente.</p>
                    <div style={{ marginTop: '20px' }}>
                        <Link href="/login" style={{ 
                            color: '#4F46E5', 
                            textDecoration: 'none', 
                            fontWeight: '600' 
                        }}>
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="code">Código de Verificación</label>
                        <input 
                            type="text" 
                            id="code" 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            disabled={isLoading}
                            required
                            placeholder="Ingresa el código de 6 dígitos"
                            maxLength={6}
                        />
                        
                        <label htmlFor="password">Nueva Contraseña</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                            minLength={6}
                            placeholder="Mínimo 6 caracteres"
                        />
                        
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            required
                            placeholder="Repite tu contraseña"
                        />
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{ 
                                opacity: isLoading ? 0.6 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
                        </button>
                    </form>
                    
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Link href="/login/forgot-password" style={{ 
                            color: '#4F46E5', 
                            textDecoration: 'none', 
                            fontSize: '14px' 
                        }}>
                            ¿No recibiste el código? Solicitar otro
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            <header style={{ backgroundColor: '#4F46E5', color: 'white', padding: '1rem', textAlign: 'center' }}>
                <h1 className="header-logo">SportHub</h1>
            </header>
            
            <div className="login-container">
                <div className="login-form">
                    <Suspense fallback={<div className="login-left">Cargando...</div>}>
                        <ResetPasswordContent />
                    </Suspense>
                    
                    <div className="login-right">
                        <img src="/imagenes/logo_sporthub.jpg" alt="Sporthub logo" />
                    </div>
                </div>
            </div>
        </div>
    );
}