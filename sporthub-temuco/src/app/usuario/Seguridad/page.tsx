'use client';

import './seguridad.css';
import React, { useState } from 'react';
import { Input, Button } from '../componentes/compUser';
import UserLayout from '../UsuarioLayout';

export default function SeguridadPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [allowEmails, setAllowEmails] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    console.log("Nueva contraseña guardada:", newPassword);
    alert("Contraseña cambiada exitosamente");
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    checkPasswordStrength(password);
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
        {/* Header de seguridad simplificado */}
        <div className="seguridad-header">
          <h1 className="seguridad-titulo">Seguridad de la Cuenta</h1>
          <p className="seguridad-subtitulo">Gestiona la seguridad de tu cuenta</p>
        </div>

        <div className="bloque-principal">
          <div className="contenedor-flex">

            {/* Sección izquierda - Formulario y contacto */}
            <div className="seccion-izquierda">
              {/* Tarjeta de cambio de contraseña */}
              <div className="security-card">
                <h2 className="titulo-seccion">Cambiar Contraseña</h2>
                
                <form onSubmit={handleChangePassword} className="password-form">
                  <p className="texto-secundario">
                    Protege tu cuenta con una contraseña segura y única.
                  </p>

                  <div className="input-group">
                    <label>Contraseña Actual</label>
                    <Input
                      type="password"
                      placeholder="Ingresa tu contraseña actual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="security-input"
                    />
                  </div>

                  <div className="input-group">
                    <label>Nueva Contraseña</label>
                    <Input
                      type="password"
                      placeholder="Crea una nueva contraseña"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      className="security-input"
                    />
                    
                    {newPassword && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div 
                            className={`strength-fill ${passwordStrength >= 75 ? 'strong' : passwordStrength >= 50 ? 'medium' : 'weak'}`}
                            style={{ width: `${passwordStrength}%` }}
                          ></div>
                        </div>
                        <span className="strength-text">
                          {passwordStrength >= 75 ? 'Fuerte' : passwordStrength >= 50 ? 'Media' : 'Débil'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label>Confirmar Nueva Contraseña</label>
                    <Input
                      type="password"
                      placeholder="Repite tu nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="security-input"
                    />
                  </div>

                  <div className="requisitos-container">
                    <h4>Requisitos de seguridad:</h4>
                    <ul className="requisitos-list">
                      <li className={newPassword.length >= 8 ? 'valid' : ''}>Mínimo 8 caracteres</li>
                      <li className={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'valid' : ''}>Mayúsculas y minúsculas</li>
                      <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>Al menos un número</li>
                      <li className={/[!@#$%^&*]/.test(newPassword) ? 'valid' : ''}>Al menos un símbolo</li>
                    </ul>
                  </div>

                  <Button type="submit" variant="primary" className="btn-security">
                    Actualizar Contraseña
                  </Button>
                </form>
              </div>

              {/* Contactar administrador debajo del formulario */}
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

            {/* Sección derecha - Actividad y notificaciones */}
            <div className="seccion-derecha">
              {/* Actividad de seguridad */}
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

              {/* Notificaciones por correo debajo de la actividad */}
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