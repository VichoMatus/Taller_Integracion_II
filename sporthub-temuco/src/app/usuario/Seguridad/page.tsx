'use client';

import './seguridad.css';
import React, { useState, useCallback } from 'react';
import { Input, Button } from '../componentes/compUser';
import UserLayout from '../UsuarioLayout';
import authService from '@/services/authService';

export default function SeguridadPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [allowEmails, setAllowEmails] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calcular fuerza de contraseña (solo mínimo 8 caracteres es obligatorio)
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

    // Validaciones básicas
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

    
    // ...existing code...
    try {
      const response = await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      
      console.log("Respuesta cambio contraseña:", response);
      
      // Verificar si la respuesta es un objeto y contiene mensaje de éxito
      // Acceder directamente a response ya que puede no tener .data
      const responseMessage = ((response as any).message || 
                              (response as any).error || 
                              '').toLowerCase();
      
      if (responseMessage.includes('contraseña actualizada correctamente') || 
          responseMessage.includes('password updated successfully')) {
        setSuccess("Contraseña cambiada exitosamente");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStrength(0);
      } else if ((response as any).ok === false) {
        setError((response as any).error || (response as any).message || "Error desconocido");
      } else {
        setSuccess("Contraseña cambiada exitosamente");
      }
    } catch (err: any) {
      console.error("Error completo:", err);
      
      // Verificar si hay un mensaje específico sobre contraseña incorrecta
      if (err?.response?.data?.detail?.includes("contraseña actual") || 
          err?.response?.data?.error?.includes("contraseña actual") || 
          err?.response?.data?.message?.includes("contraseña actual")) {
        setError("La contraseña actual es incorrecta");
      } 
      else if (err?.response?.status === 401) {
        setError("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      }
      else if (err?.response?.data?.detail) {
        setError(err.response.data.detail);
      } 
      else if (err?.message) {
        setError(err.message);
      } 
      else {
        setError("No se pudo cambiar la contraseña. Intente nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
    // ...existing code...


  };

  const seguridadLogs = [
    { id: 1, fecha: "01-01-2025", hora: "12:00", evento: "Sesión Iniciada" },
    { id: 2, fecha: "01-01-2025", hora: "12:25", evento: "Sesión Cerrada" },
    { id: 3, fecha: "01-01-2025", hora: "18:13", evento: "Sesión Iniciada" },
    { id: 4, fecha: "01-01-2025", hora: "19:51", evento: "Sesión Cerrada" },
    { id: 5, fecha: "01-02-2025", hora: "01:48", evento: "Sesión Iniciada" },
  ];

  return (
    <UserLayout
      userName="Usuario"
      sport={undefined}
      notificationCount={2}
    >
      <div className="seguridad-wrapper">
        <div className="seguridad-header">
          <h1 className="seguridad-titulo">Seguridad de la Cuenta</h1>
          <p className="seguridad-subtitulo">Gestiona la seguridad de tu cuenta</p>
        </div>

        <div className="bloque-principal">
          <div className="contenedor-flex">

            <div className="seccion-izquierda">
              <div className="security-card">
                <h2 className="titulo-seccion">Cambiar Contraseña</h2>
                
                <form onSubmit={handleChangePassword} className="password-form">
                  <p className="texto-secundario">
                    Protege tu cuenta con una contraseña segura y única.
                  </p>

                  {error && <div className="error-message" style={{ 
                    background: '#fee2e2', 
                    color: '#dc2626', 
                    padding: '12px', 
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    marginBottom: '16px'
                  }}>
                    {error}
                  </div>}
                  
                  {success && <div className="success-message" style={{ 
                    background: '#d1fae5', 
                    color: '#065f46', 
                    padding: '12px', 
                    borderRadius: '8px',
                    border: '1px solid #a7f3d0',
                    marginBottom: '16px'
                  }}>
                    {success}
                  </div>}

                  <div className="input-group">
                    <label>Contraseña Actual *</label>
                    <Input
                      type="password"
                      placeholder="Ingresa tu contraseña actual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="security-input"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="input-group">
                    <label>Nueva Contraseña *</label>
                    <Input
                      type="password"
                      placeholder="Crea una nueva contraseña (mínimo 8 caracteres)"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      className="security-input"
                      required
                      disabled={isLoading}
                    />
                    
                    {newPassword && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div 
                            className={`strength-fill ${
                              passwordStrength >= 60 ? 'strong' : 
                              passwordStrength >= 40 ? 'medium' : 'weak'
                            }`}
                            style={{ width: `${passwordStrength}%` }}
                          ></div>
                        </div>
                        <span className="strength-text">
                          {passwordStrength >= 60 ? 'Fuerte' : 
                           passwordStrength >= 40 ? 'Media' : 'Débil'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label>Confirmar Nueva Contraseña *</label>
                    <Input
                      type="password"
                      placeholder="Repite tu nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="security-input"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="requisitos-container">
                    <h4>Requisitos de seguridad:</h4>
                    <ul className="requisitos-list">
                      <li className={newPassword.length >= 8 ? 'valid' : ''}>
                        Mínimo 8 caracteres *
                      </li>
                      <li className={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'valid' : ''}>
                        Mayúsculas y minúsculas (recomendado)
                      </li>
                      <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>
                        Al menos un número (recomendado)
                      </li>
                      <li className={/[!@#$%^&*]/.test(newPassword) ? 'valid' : ''}>
                        Al menos un símbolo (!@#$%^&*) (recomendado)
                      </li>
                    </ul>
                    <p style={{ fontSize: '0.8rem', color: 'var(--security-text-light)', marginTop: '8px', fontStyle: 'italic' }}>
                      * Campo obligatorio
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="btn-security"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </Button>
                </form>
              </div>

              <div className="security-card contact-admin">
                <h2 className="titulo-seccion">¿Necesitas Ayuda?</h2>
                <div className="contact-content">
                  <p className="texto-secundario">
                    Si detectas actividad sospechosa en tu cuenta, contacta inmediatamente a un administrador.
                  </p>
                  <Button variant="primary" className="btn-contact-admin">
                    Contactar un Administrador
                  </Button>
                </div>
              </div>
            </div>

            <div className="seccion-derecha">
              <div className="security-card">
                <h2 className="titulo-seccion">Actividad Reciente</h2>
                <p className="texto-secundario">
                  Registro de inicios de sesión en tu cuenta.
                </p>
                <div className="activity-log">
                  {seguridadLogs.map((log) => (
                    <div key={log.id} className="log-entry">
                      <div className="log-icon">{log.evento.includes('Iniciada') ? '🔓' : '🔒'}</div>
                      <div className="log-details">
                        <div className="log-event">{log.evento}</div>
                        <div className="log-meta">{log.fecha} • {log.hora}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="security-card">
                <h2 className="titulo-seccion">Notificaciones por Correo</h2>
                <div className="email-preferences">
                  <div className="preference-item">
                    <div className="preference-info">
                      <h4>Alertas de seguridad</h4>
                      <p>Recibe notificaciones sobre actividad importante</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={allowEmails}
                        onChange={() => setAllowEmails(!allowEmails)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <p className="preference-note">
                    Recibirás correos importantes sobre la seguridad de tu cuenta.
                  </p>
                  <Button variant="secondary" className="btn-security-outline">
                    Guardar Preferencias
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </UserLayout>
  );
}