'use client';

import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminsLayout";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import "./cambiocontra.css";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof ChangePasswordData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined
      }));
    }
    
    setSuccess(null);
  };

  const handleGuardar = async () => {
    try {
      setLoading(true);
      setErrors({});
      setSuccess(null);

      const newErrors: FormErrors = {};
      
      if (!formData.currentPassword.trim()) {
        newErrors.currentPassword = "La contraseña actual es requerida";
      }
      
      if (!formData.newPassword.trim()) {
        newErrors.newPassword = "La nueva contraseña es requerida";
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = "La contraseña debe tener al menos 8 caracteres";
      }
      
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = "Confirma tu nueva contraseña";
      } else if (formData.confirmPassword !== formData.newPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      await authService.changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });

      setSuccess("¡Contraseña actualizada correctamente!");
      
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setTimeout(() => {
        router.push("/admin/perfil");
      }, 2000);

    } catch (err: any) {
      console.error('Error cambiando contraseña:', err);
      
      const errorStatus = err?.response?.status;
      
      if (errorStatus === 400) {
        setErrors({
          currentPassword: "La contraseña actual es incorrecta"
        });
      } 
      else if (errorStatus === 401) {
        setErrors({
          general: "Tu sesión ha expirado. Por favor inicia sesión nuevamente."
        });
      } 
      else {
        setErrors({
          general: "Error al cambiar la contraseña. Intenta nuevamente."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.length >= 12) strength += 15;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) strength += 20;
    if (/[0-9]/.test(pass)) strength += 20;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 20;
    return Math.min(100, strength);
  };

  const passwordStrength = checkPasswordStrength(formData.newPassword);
  
  const getStrengthLabel = (strength: number) => {
    if (strength >= 80) return "Muy Fuerte";
    if (strength >= 60) return "Fuerte";
    if (strength >= 40) return "Media";
    return "Débil";
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return "#10b981";
    if (strength >= 60) return "#3b82f6";
    if (strength >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const isFormValid = 
    formData.currentPassword.trim() && 
    formData.newPassword.trim() && 
    formData.confirmPassword.trim() &&
    formData.newPassword === formData.confirmPassword &&
    formData.newPassword.length >= 8 &&
    !errors.currentPassword &&
    !errors.newPassword &&
    !errors.confirmPassword;

  return (
    <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
      <div className="change-password-page">
        {/* Panel Izquierdo - Formulario */}
        <div className="password-left">
          <div className="page-header">
            <div className="page-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <h1 className="page-title">Cambiar Contraseña</h1>
            <p className="page-subtitle">Actualiza tus credenciales de seguridad</p>
          </div>

          {errors.general && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errors.general}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {success}
            </div>
          )}

          <div className="password-form">
            {/* Contraseña Actual */}
            <div className="form-group">
              <label className="form-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Contraseña Actual
              </label>
              <Input
                type="password"
                placeholder="Ingresa tu contraseña actual"
                value={formData.currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange('currentPassword', e.target.value)
                }
                className={`form-input ${errors.currentPassword ? 'input-error' : ''}`}
                disabled={loading}
              />
              <span className="form-hint">Para verificar tu identidad</span>
              {errors.currentPassword && (
                <span className="error-message">{errors.currentPassword}</span>
              )}
            </div>

            {/* Nueva Contraseña */}
            <div className="form-group">
              <label className="form-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Nueva Contraseña
              </label>
              <Input
                type="password"
                placeholder="Ej: MiP@ssw0rd2024!"
                value={formData.newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange('newPassword', e.target.value)
                }
                className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
                disabled={loading}
              />
              <span className="form-hint">Mínimo 8 caracteres, incluye mayúsculas, números y símbolos</span>
              {errors.newPassword && (
                <span className="error-message">{errors.newPassword}</span>
              )}
              
              {formData.newPassword && !errors.newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{
                        width: `${passwordStrength}%`,
                        backgroundColor: getStrengthColor(passwordStrength)
                      }}
                    ></div>
                  </div>
                  <span className="strength-label" style={{ color: getStrengthColor(passwordStrength) }}>
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="form-group">
              <label className="form-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Confirmar Nueva Contraseña
              </label>
              <Input
                type="password"
                placeholder="Repite la nueva contraseña"
                value={formData.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange('confirmPassword', e.target.value)
                }
                className={`form-input ${errors.confirmPassword ? 'input-error' : formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'input-success' : ''}`}
                disabled={loading}
              />
              <span className="form-hint">Asegúrate de que coincida exactamente</span>
              {errors.confirmPassword ? (
                <span className="error-message">{errors.confirmPassword}</span>
              ) : formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0 && (
                <span className="success-message">Las contraseñas coinciden</span>
              )}
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button 
                className="btn btn-cancel"
                onClick={() => router.push("/admin/editarperfil")}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-save"
                onClick={handleGuardar}
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Requisitos y Aviso */}
        <div className="password-right">
          <div className="requirements-section">
            {/* Aviso de Seguridad */}
            <div className="security-notice">
              <span className="notice-icon">🛡️</span>
              <h3 className="notice-title">Tu Seguridad es Nuestra Prioridad</h3>
              <p className="notice-text">
                Como administrador, tu contraseña protege información sensible del sistema. 
                Asegúrate de crear una contraseña única y fuerte que no utilices en otros servicios. 
                Nunca compartas tus credenciales con terceros.
              </p>
            </div>

            {/* Requisitos de Seguridad */}
            <div className="requirements-card">
              <div className="requirements-header">
                <span className="req-icon-large">🔒</span>
                <h3 className="requirements-title">Requisitos de Seguridad</h3>
                <p className="requirements-subtitle">Tu contraseña debe cumplir con:</p>
              </div>
              <div className="requirements-list">
                <div className={`requirement ${formData.newPassword.length >= 8 ? 'valid' : ''}`}>
                  <span className="req-check">{formData.newPassword.length >= 8 ? '✓' : '○'}</span>
                  <span className="req-text">Mínimo 8 caracteres</span>
                </div>
                <div className={`requirement ${/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'valid' : ''}`}>
                  <span className="req-check">{/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? '✓' : '○'}</span>
                  <span className="req-text">Mayúsculas y minúsculas</span>
                </div>
                <div className={`requirement ${/[0-9]/.test(formData.newPassword) ? 'valid' : ''}`}>
                  <span className="req-check">{/[0-9]/.test(formData.newPassword) ? '✓' : '○'}</span>
                  <span className="req-text">Al menos un número</span>
                </div>
                <div className={`requirement ${/[^A-Za-z0-9]/.test(formData.newPassword) ? 'valid' : ''}`}>
                  <span className="req-check">{/[^A-Za-z0-9]/.test(formData.newPassword) ? '✓' : '○'}</span>
                  <span className="req-text">Carácter especial (!@#$%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}