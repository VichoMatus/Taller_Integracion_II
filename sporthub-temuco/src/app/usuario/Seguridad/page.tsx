'use client';

import './seguridad.css';
import React, { useState, useEffect } from 'react';
import { Input, Button } from '../componentes/compUser';
import UserLayout from '../UsuarioLayout';
import authService from '@/services/authService';
import Link from 'next/link';

export default function SeguridadPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await authService.me();
        setUserData(data);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      }
    }
    fetchUser();
  }, []);

  // Calcular fuerza de contraseña
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 40;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*]/.test(password)) strength += 20;
    setPasswordStrength(strength);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    checkPasswordStrength(password);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setIsLoading(true);

    // Validaciones
    if (!currentPassword.trim()) {
      setError("Por favor ingresa tu contraseña actual.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      
      const responseMessage = ((response as any).message || 
                              (response as any).error || 
                              '').toLowerCase();
      
      if (responseMessage.includes('contraseña actualizada correctamente') || 
          responseMessage.includes('password updated successfully')) {
        setSuccess("✅ Contraseña cambiada exitosamente");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStrength(0);
      } else if ((response as any).ok === false) {
        setError((response as any).error || (response as any).message || "Error desconocido");
      } else {
        setSuccess("✅ Contraseña cambiada exitosamente");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStrength(0);
      }
    } catch (err: any) {
      if (err?.response?.data?.detail?.includes("contraseña actual") || 
          err?.response?.data?.error?.includes("contraseña actual") || 
          err?.response?.data?.message?.includes("contraseña actual")) {
        setError("❌ La contraseña actual es incorrecta");
      } else if (err?.response?.status === 401) {
        setError("❌ Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      } else if (err?.response?.data?.detail) {
        setError("❌ " + err.response.data.detail);
      } else if (err?.message) {
        setError("❌ " + err.message);
      } else {
        setError("❌ No se pudo cambiar la contraseña. Intente nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const userInitial = userData?.nombre ? userData.nombre.charAt(0).toUpperCase() : "U";
  const fullName = userData ? `${userData.nombre} ${userData.apellido}` : "Usuario";

  return (
    <UserLayout userName={fullName}>
      <div className="seguridad-wrapper">
        <div className="seguridad-container">
          
          {/* SIDEBAR IZQUIERDA */}
          <div className="seguridad-left">
            <div className="seguridad-header-gradient"></div>
            
            <div className="avatar-section-security">
              <div className="avatar-iniciales-security">
                {userData?.avatar_url ? (
                  <img src={userData.avatar_url} alt="Avatar" />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>
              <h2>{fullName}</h2>
              <p className="rol-badge">{userData?.rol || "Usuario"}</p>
            </div>

            <div className="security-info-box">
              <h3>🔐 Configuración de Seguridad</h3>
              <p>
                Mantén tu cuenta protegida actualizando regularmente tu contraseña.
                Usa una combinación de letras, números y símbolos para mayor seguridad.
              </p>
            </div>

            <Link href="/usuario/perfil" className="btn-back-security">
              ← Volver al Perfil
            </Link>
          </div>

          {/* CONTENIDO DERECHA */}
          <div className="seguridad-right">
            <div className="seguridad-main-header">
              <h1 className="seguridad-titulo">Seguridad de la Cuenta</h1>
              <p className="seguridad-subtitulo">Gestiona la seguridad y privacidad de tu cuenta</p>
            </div>

            <div className="seguridad-content-scroll">
              
              {/* CAMBIAR CONTRASEÑA */}
              <div className="seguridad-section">
                <h3 className="seguridad-section-title">
                  🔑 Cambiar Contraseña
                </h3>
                
                <form onSubmit={handleChangePassword} className="password-form">
                  {error && (
                    <div className="mensaje-error">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="mensaje-exito">
                      {success}
                    </div>
                  )}

                  <div className="form-grid">
                    <div className="input-group-security">
                      <label className="input-label-security">Contraseña Actual *</label>
                      <Input
                        type="password"
                        placeholder="Ingresa tu contraseña actual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="input-security"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="input-group-security">
                      <label className="input-label-security">Nueva Contraseña *</label>
                      <Input
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        className="input-security"
                        required
                        disabled={isLoading}
                      />
                      
                      {newPassword && (
                        <div className="password-strength-container">
                          <div className="strength-bar-bg">
                            <div 
                              className={`strength-bar-fill ${
                                passwordStrength >= 80 ? 'strong' : 
                                passwordStrength >= 60 ? 'good' :
                                passwordStrength >= 40 ? 'medium' : 'weak'
                              }`}
                              style={{ width: `${passwordStrength}%` }}
                            ></div>
                          </div>
                          <span className={`strength-label ${
                            passwordStrength >= 80 ? 'strong' : 
                            passwordStrength >= 60 ? 'good' :
                            passwordStrength >= 40 ? 'medium' : 'weak'
                          }`}>
                            {passwordStrength >= 80 ? '💪 Muy Fuerte' : 
                             passwordStrength >= 60 ? '✅ Fuerte' :
                             passwordStrength >= 40 ? '⚠️ Media' : '❌ Débil'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="input-group-security">
                      <label className="input-label-security">Confirmar Nueva Contraseña *</label>
                      <Input
                        type="password"
                        placeholder="Repite tu nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-security"
                        required
                        disabled={isLoading}
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <span className="password-mismatch">❌ Las contraseñas no coinciden</span>
                      )}
                      {confirmPassword && newPassword === confirmPassword && (
                        <span className="password-match">✅ Las contraseñas coinciden</span>
                      )}
                    </div>
                  </div>

                  <div className="requisitos-box">
                    <h4>📋 Requisitos de Seguridad</h4>
                    <ul className="requisitos-list-modern">
                      <li className={newPassword.length >= 8 ? 'valid' : ''}>
                        <span className="req-icon">{newPassword.length >= 8 ? '✅' : '⭕'}</span>
                        <span>Mínimo 8 caracteres (Obligatorio)</span>
                      </li>
                      <li className={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'valid' : ''}>
                        <span className="req-icon">{/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? '✅' : '⭕'}</span>
                        <span>Mayúsculas y minúsculas (Recomendado)</span>
                      </li>
                      <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>
                        <span className="req-icon">{/[0-9]/.test(newPassword) ? '✅' : '⭕'}</span>
                        <span>Al menos un número (Recomendado)</span>
                      </li>
                      <li className={/[!@#$%^&*]/.test(newPassword) ? 'valid' : ''}>
                        <span className="req-icon">{/[!@#$%^&*]/.test(newPassword) ? '✅' : '⭕'}</span>
                        <span>Al menos un símbolo !@#$%^&* (Recomendado)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="form-actions-security">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="btn-save-security"
                      disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 8}
                    >
                      {isLoading ? '🔄 Actualizando...' : '💾 Actualizar Contraseña'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* AYUDA */}
              <div className="seguridad-section help-section">
                <h3 className="seguridad-section-title">
                  ❓ ¿Necesitas Ayuda?
                </h3>
                <div className="help-content">
                  <div className="help-icon">🛡️</div>
                  <div className="help-text">
                    <h4>Seguridad y Soporte</h4>
                    <p>
                      Si detectas actividad sospechosa en tu cuenta o tienes problemas 
                      para acceder, contacta inmediatamente a un administrador.
                    </p>
                  </div>
                </div>
                <button className="btn-contact-admin">
                  📧 Contactar Administrador
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}