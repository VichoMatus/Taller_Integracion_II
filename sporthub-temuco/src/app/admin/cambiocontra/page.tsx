"use client";

import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminsLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import "./cambiocontra.css";

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const handleGuardar = () => {
    if (!password || !confirmar) {
      alert("Debes completar todos los campos.");
      return;
    }
    if (password !== confirmar) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    alert("Contraseña actualizada correctamente ✅");
    // Aquí puedes llamar a tu API
  };

  const checkPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = checkPasswordStrength(password);
  const strengthLabels = ["Muy Débil", "Débil", "Regular", "Fuerte", "Muy Fuerte"];
  const strengthColors = ["#ff4444", "#ff8800", "#ffbb33", "#00C851", "#007E33"];

  return (
    <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
      <div className="change-password-container">
        <div className="change-password-card">
          {/* Botón de volver en div separado */}
          <div className="back-button-container">
            <button 
              className="back-button"
              onClick={() => router.push("/admin/editarperfil")}
            >
              ← Volver al Perfil
            </button>
          </div>

          <div className="password-header">
            <h1 className="title">Cambiar Contraseña</h1>
          </div>

          <div className="password-form">
            <div className="input-group">
              <label className="input-label">Nueva Contraseña</label>
              <Input
                type="password"
                placeholder="Introduce tu nueva contraseña"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="password-input"
              />
              
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: strengthColors[passwordStrength - 1] || '#ccc'
                      }}
                    ></div>
                  </div>
                  <span className="strength-text">
                    Fortaleza: {strengthLabels[passwordStrength - 1] || 'Muy Débil'}
                  </span>
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Confirmar Contraseña</label>
              <Input
                type="password"
                placeholder="Vuelve a introducir la contraseña"
                value={confirmar}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmar(e.target.value)}
                className="password-input"
              />
              {confirmar && password !== confirmar && (
                <span className="error-text">Las contraseñas no coinciden</span>
              )}
              {confirmar && password === confirmar && password.length > 0 && (
                <span className="success-text">Las contraseñas coinciden ✓</span>
              )}
            </div>

            {/* Requisitos siempre visibles */}
            <div className="requirements-panel">
              <div className="requirements-header">
                <h3>Requisitos de Seguridad para Administradores</h3>
                <p>Tu contraseña debe cumplir con los siguientes requisitos:</p>
              </div>
              
              <div className="requirements-grid">
                <div className="requirement-item">
                  <span className={`requirement-icon ${password.length >= 8 ? 'valid' : ''}`}>
                    {password.length >= 8 ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${password.length >= 8 ? 'valid' : ''}`}>
                    Mínimo 8-12 caracteres (ideal 12+)
                  </span>
                </div>
                
                <div className="requirement-item">
                  <span className={`requirement-icon ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'valid' : ''}`}>
                    {/[A-Z]/.test(password) && /[a-z]/.test(password) ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'valid' : ''}`}>
                    Mayúsculas y minúsculas
                  </span>
                </div>
                
                <div className="requirement-item">
                  <span className={`requirement-icon ${/[0-9]/.test(password) ? 'valid' : ''}`}>
                    {/[0-9]/.test(password) ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${/[0-9]/.test(password) ? 'valid' : ''}`}>
                    Al menos un número
                  </span>
                </div>
                
                <div className="requirement-item">
                  <span className={`requirement-icon ${/[^A-Za-z0-9]/.test(password) ? 'valid' : ''}`}>
                    {/[^A-Za-z0-9]/.test(password) ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${/[^A-Za-z0-9]/.test(password) ? 'valid' : ''}`}>
                    Al menos un símbolo especial
                  </span>
                </div>
              </div>
              
              <div className="security-notice">
                <p>
                  <strong>Importante:</strong> Como administrador, tu contraseña es crítica para la seguridad del sistema. 
                  No uses datos personales ni contraseñas anteriores.
                </p>
              </div>
            </div>

            <div className="form-actions">
              <Button 
                onClick={handleGuardar} 
                className="save-button"
                disabled={passwordStrength < 4 || password !== confirmar}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}