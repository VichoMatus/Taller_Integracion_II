'use client';

import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminsLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import "./cambiocontra.css";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof ChangePasswordData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleGuardar = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validaciones básicas
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        setError("Debes completar todos los campos.");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("Las nuevas contraseñas no coinciden.");
        return;
      }

      if (formData.currentPassword === formData.newPassword) {
        setError("La nueva contraseña debe ser diferente a la actual.");
        return;
      }

      // Validar fortaleza de contraseña
      const strength = checkPasswordStrength(formData.newPassword);
      if (strength < 3) {
        setError("La contraseña no cumple con los requisitos de seguridad.");
        return;
      }

      console.log('Enviando cambio de contraseña...');

      // ✅ CORREGIDO: Solo enviar los campos que espera el backend
      await authService.changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword
        // confirm_password se valida solo en frontend, no se envía al backend
      });

      setSuccess("✅ Contraseña actualizada correctamente");
      
      // Limpiar formulario
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/admin/perfil");
      }, 2000);

    } catch (err: any) {
      console.error('Error cambiando contraseña:', err);
      setError(err.message || "Error al cambiar la contraseña. Verifica tu contraseña actual.");
    } finally {
      setLoading(false);
    }
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

  const passwordStrength = checkPasswordStrength(formData.newPassword);
  const strengthLabels = ["Muy Débil", "Débil", "Regular", "Fuerte", "Muy Fuerte"];
  const strengthColors = ["#ff4444", "#ff8800", "#ffbb33", "#00C851", "#007E33"];

  const isFormValid = 
    formData.currentPassword && 
    formData.newPassword && 
    formData.confirmPassword && 
    formData.newPassword === formData.confirmPassword &&
    passwordStrength >= 3 &&
    formData.currentPassword !== formData.newPassword;

  return (
    <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
      <div className="change-password-container">
        <div className="change-password-card">
          <div className="back-button-container">
            <button 
              className="back-button"
              onClick={() => router.push("/admin/editarperfil")}
              disabled={loading}
            >
              ← Volver al Perfil
            </button>
          </div>

          <div className="password-header">
            <h1 className="title">Cambiar Contraseña</h1>
            <p className="subtitle">Actualiza tu contraseña de administrador</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="password-form">
            <div className="input-group">
              <label className="input-label">Contraseña Actual</label>
              <Input
                type="password"
                placeholder="Introduce tu contraseña actual"
                value={formData.currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange('currentPassword', e.target.value)
                }
                className="password-input"
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Nueva Contraseña</label>
              <Input
                type="password"
                placeholder="Introduce tu nueva contraseña"
                value={formData.newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange('newPassword', e.target.value)
                }
                className="password-input"
                disabled={loading}
              />
              
              {formData.newPassword && (
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
              <label className="input-label">Confirmar Nueva Contraseña</label>
              <Input
                type="password"
                placeholder="Vuelve a introducir la nueva contraseña"
                value={formData.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange('confirmPassword', e.target.value)
                }
                className="password-input"
                disabled={loading}
              />
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <span className="error-text">Las contraseñas no coinciden</span>
              )}
              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0 && (
                <span className="success-text">Las contraseñas coinciden ✓</span>
              )}
            </div>

            <div className="requirements-panel">
              <div className="requirements-header">
                <h3>Requisitos de Seguridad para Administradores</h3>
                <p>Tu contraseña debe cumplir con los siguientes requisitos:</p>
              </div>
              
              <div className="requirements-grid">
                <div className="requirement-item">
                  <span className={`requirement-icon ${formData.newPassword.length >= 8 ? 'valid' : ''}`}>
                    {formData.newPassword.length >= 8 ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${formData.newPassword.length >= 8 ? 'valid' : ''}`}>
                    Mínimo 8-12 caracteres (ideal 12+)
                  </span>
                </div>
                
                <div className="requirement-item">
                  <span className={`requirement-icon ${/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    {/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    Mayúsculas y minúsculas
                  </span>
                </div>
                
                <div className="requirement-item">
                  <span className={`requirement-icon ${/[0-9]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    {/[0-9]/.test(formData.newPassword) ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${/[0-9]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    Al menos un número
                  </span>
                </div>
                
                <div className="requirement-item">
                  <span className={`requirement-icon ${/[^A-Za-z0-9]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    {/[^A-Za-z0-9]/.test(formData.newPassword) ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${/[^A-Za-z0-9]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    Al menos un símbolo especial
                  </span>
                </div>

                <div className="requirement-item">
                  <span className={`requirement-icon ${formData.currentPassword && formData.newPassword && formData.currentPassword !== formData.newPassword ? 'valid' : ''}`}>
                    {formData.currentPassword && formData.newPassword && formData.currentPassword !== formData.newPassword ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${formData.currentPassword && formData.newPassword && formData.currentPassword !== formData.newPassword ? 'valid' : ''}`}>
                    Diferente a la contraseña actual
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
                disabled={!isFormValid || loading}
              >
                {loading ? 'Cambiando Contraseña...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}