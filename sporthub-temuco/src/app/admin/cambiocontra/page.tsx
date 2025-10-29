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
  const [currentPasswordValid, setCurrentPasswordValid] = useState(false);

  const handleInputChange = (field: keyof ChangePasswordData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error específico del campo cuando el usuario empiece a escribir
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
    
    // Si el usuario modifica la contraseña actual, resetear la validación
    if (field === 'currentPassword') {
      setCurrentPasswordValid(false);
    }
    
    setSuccess(null);
  };

  // Validaciones en tiempo real
  const validateField = (field: keyof ChangePasswordData, value: string): string | undefined => {
    switch (field) {
      case 'currentPassword':
        if (!value.trim()) return "La contraseña actual es requerida";
        return undefined;
      
      case 'newPassword':
        if (!value.trim()) return "La nueva contraseña es requerida";
        if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
        return undefined;
      
      case 'confirmPassword':
        if (!value.trim()) return "Confirma tu nueva contraseña";
        if (value !== formData.newPassword) return "Las contraseñas no coinciden";
        return undefined;
      
      default:
        return undefined;
    }
  };

  const handleBlur = (field: keyof ChangePasswordData) => {
    const error = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleGuardar = async () => {
    try {
      setLoading(true);
      setErrors({});
      setSuccess(null);

      // Validar todos los campos antes de enviar
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

      console.log('Enviando cambio de contraseña...');

      await authService.changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });

      // ÉXITO: Contraseña cambiada correctamente
      setSuccess("✅ Contraseña actualizada correctamente");
      setCurrentPasswordValid(true);
      
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
      
      const errorStatus = err?.response?.status;
      const errorDetail = err?.response?.data?.detail;
      
      if (errorStatus === 400) {
        // ERROR ESPECÍFICO: Contraseña actual incorrecta
        setErrors({
          currentPassword: "La contraseña actual es incorrecta"
        });
        setCurrentPasswordValid(false);
      } 
      else if (errorStatus === 401) {
        setErrors({
          general: "Tu sesión ha expirado. Por favor inicia sesión nuevamente."
        });
      } 
      else if (errorDetail) {
        setErrors({
          general: errorDetail
        });
      } 
      else if (err?.message) {
        setErrors({
          general: err.message
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
    if (pass.length >= 8) strength += 40;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) strength += 20;
    if (/[0-9]/.test(pass)) strength += 20;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 20;
    return strength;
  };

  const passwordStrength = checkPasswordStrength(formData.newPassword);
  
  const getStrengthLabel = (strength: number) => {
    if (strength >= 60) return "Fuerte";
    if (strength >= 40) return "Media";
    return "Débil";
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 60) return "#00C851";
    if (strength >= 40) return "#ffbb33";
    return "#ff4444";
  };

  // El botón se habilita solo cuando:
  // 1. Todos los campos tienen contenido
  // 2. No hay errores de validación frontend
  // 3. Las contraseñas coinciden
  // 4. Tiene al menos 8 caracteres
  // 5. NO hay error de contraseña actual incorrecta (después de un intento fallido)
  const isFormValid = 
    formData.currentPassword.trim() && 
    formData.newPassword.trim() && 
    formData.confirmPassword.trim() &&
    formData.newPassword === formData.confirmPassword &&
    formData.newPassword.length >= 8 &&
    !errors.currentPassword && // Esto incluye el error de "contraseña actual incorrecta"
    !errors.newPassword &&
    !errors.confirmPassword;

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

          {errors.general && (
            <div className="error-message">
              {errors.general}
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
                onBlur={() => handleBlur('currentPassword')}
                className={`password-input ${errors.currentPassword ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.currentPassword && (
                <span className="error-text">{errors.currentPassword}</span>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Nueva Contraseña</label>
              <Input
                type="password"
                placeholder="Introduce tu nueva contraseña (mínimo 8 caracteres)"
                value={formData.newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange('newPassword', e.target.value)
                }
                onBlur={() => handleBlur('newPassword')}
                className={`password-input ${errors.newPassword ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.newPassword && (
                <span className="error-text">{errors.newPassword}</span>
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
                  <span className="strength-text">
                    Fortaleza: {getStrengthLabel(passwordStrength)}
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
                onBlur={() => handleBlur('confirmPassword')}
                className={`password-input ${errors.confirmPassword ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.confirmPassword ? (
                <span className="error-text">{errors.confirmPassword}</span>
              ) : formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0 && (
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
                    Mínimo 8 caracteres *
                  </span>
                </div>
                
                <div className="requirement-item">
                  <span className={`requirement-icon ${/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    {/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    Mayúsculas y minúsculas (recomendado)
                  </span>
                </div>
                
                <div className="requirement-item">
                  <span className={`requirement-icon ${/[0-9]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    {/[0-9]/.test(formData.newPassword) ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${/[0-9]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    Al menos un número (recomendado)
                  </span>
                </div>
                
                <div className="requirement-item">
                  <span className={`requirement-icon ${/[^A-Za-z0-9]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    {/[^A-Za-z0-9]/.test(formData.newPassword) ? '✓' : '•'}
                  </span>
                  <span className={`requirement-text ${/[^A-Za-z0-9]/.test(formData.newPassword) ? 'valid' : ''}`}>
                    Al menos un símbolo especial (recomendado)
                  </span>
                </div>
              </div>
              
              <div className="security-notice">
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '8px', fontStyle: 'italic' }}>
                  * Campo obligatorio
                </p>
                <p>
                  <strong>Importante:</strong> Como administrador, tu contraseña es crítica para la seguridad del sistema. 
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