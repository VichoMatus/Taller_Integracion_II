'use client';

import React, { useState, useEffect } from "react";
import "./editar_perfil.css";
import Link from "next/link";
import UserLayout from "../UsuarioLayout";
import authService from "@/services/authService";
import { useRouter } from "next/navigation";

export default function EditarPerfil() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    phone: "",
    email: "",
    bio: "",
    avatar: null as string | null,
  });

  const PHONE_PREFIX = "+56 9";

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await authService.me();
        
        // Formatear el teléfono con el prefijo
        let phoneFormatted = data.telefono || "";
        if (phoneFormatted && !phoneFormatted.startsWith(PHONE_PREFIX)) {
          phoneFormatted = PHONE_PREFIX + " " + phoneFormatted.replace(/^\+?56\s?9?\s?/, "");
        } else if (!phoneFormatted) {
          phoneFormatted = PHONE_PREFIX + " ";
        }
        
        setFormData({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          phone: phoneFormatted,
          email: data.email,
          bio: data.bio || "",
          avatar: data.avatar_url || null,
        });
      } catch {
        // Si falla, inicializa con el prefijo
        setFormData(prev => ({
          ...prev,
          phone: PHONE_PREFIX + " "
        }));
      }
    }
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Si intentan borrar el prefijo, lo restauramos
    if (!value.startsWith(PHONE_PREFIX)) {
      value = PHONE_PREFIX + " ";
    }
    
    // Remover el prefijo para procesar solo los números
    const numberPart = value.slice(PHONE_PREFIX.length).trim();
    
    // Permitir solo números y espacios después del prefijo
    const cleanNumber = numberPart.replace(/[^\d\s]/g, '');
    
    // Formatear automáticamente: XXXX XXXX
    let formattedNumber = cleanNumber.replace(/\s/g, '');
    if (formattedNumber.length > 4) {
      formattedNumber = formattedNumber.slice(0, 4) + ' ' + formattedNumber.slice(4, 8);
    }
    
    // Limitar a 8 dígitos
    if (formattedNumber.replace(/\s/g, '').length > 8) {
      formattedNumber = formattedNumber.slice(0, 9); // 4 + espacio + 4
    }
    
    setFormData({
      ...formData,
      phone: PHONE_PREFIX + " " + formattedNumber
    });
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart || 0;
    
    // Prevenir borrar el prefijo
    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= PHONE_PREFIX.length + 1) {
      e.preventDefault();
    }
  };

  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    // Colocar el cursor después del prefijo
    setTimeout(() => {
      input.setSelectionRange(PHONE_PREFIX.length + 1, PHONE_PREFIX.length + 1);
    }, 0);
  };

  const handlePhoneClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart || 0;
    
    // No permitir que el cursor esté antes del prefijo
    if (cursorPosition < PHONE_PREFIX.length + 1) {
      input.setSelectionRange(PHONE_PREFIX.length + 1, PHONE_PREFIX.length + 1);
    }
  };

  const handleChangePhoto = () => {
    alert("Funcionalidad para cambiar foto (a implementar)");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      // Extraer solo el número sin el prefijo para guardar
      const phoneNumber = formData.phone.replace(PHONE_PREFIX, "").trim();
      
      const updatePayload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: phoneNumber.length > 0 ? formData.phone : "", // Guardar con prefijo o vacío
      };

      await authService.updateProfile(updatePayload);
      setSuccess("✅ Perfil actualizado correctamente");
      
      setTimeout(() => {
        router.push("/usuario/perfil");
      }, 2000);
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error);
      setError(error.message || "❌ Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const fullName = `${formData.nombre} ${formData.apellido}`.trim();
  const userInitial = formData.nombre.charAt(0).toUpperCase() || "U";

  return (
    <div id="tailwind-wrapper">
      <UserLayout userName={fullName || "Usuario"} notificationCount={2}>
        <div className="editar-perfil-wrapper">
          <div className="editar-perfil-container">
            {/* SIDEBAR IZQUIERDA */}
            <div className="editar-perfil-left">
              <div className="editar-header-gradient"></div>
              
              <div className="avatar-section">
                <div className="avatar-iniciales-editar">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={handleChangePhoto} 
                  className="btn-change-photo"
                >
                  📷 Cambiar Foto
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="editar-form-groups">
                  <div className="input-group">
                    <label className="input-label">👤 Nombre</label>
                    <input 
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ingresa tu nombre"
                      className="input"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">👥 Apellido</label>
                    <input 
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Ingresa tu apellido"
                      className="input"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">📱 Teléfono</label>
                    <input 
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onKeyDown={handlePhoneKeyDown}
                      onFocus={handlePhoneFocus}
                      onClick={handlePhoneClick}
                      placeholder={`${PHONE_PREFIX} XXXX XXXX`}
                      className="input"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">📧 Email</label>
                    <input 
                      type="email"
                      value={formData.email}
                      disabled
                      className="input-disabled"
                    />
                  </div>
                </div>

                <Link href="/usuario/perfil" className="btn-back">
                  ← Volver al Perfil
                </Link>
              </form>
            </div>

            {/* CONTENIDO DERECHA */}
            <div className="editar-perfil-right">
              <div className="editar-main-header">
                <h1 className="editar-titulo">Editar Perfil</h1>
                <p className="editar-subtitulo">Actualiza tu información personal y configuraciones</p>
              </div>

              <div className="editar-content-scroll">
                {error && (
                  <div className="error-message">{error}</div>
                )}

                {success && (
                  <div className="success-message">{success}</div>
                )}

                {/* Información de Contacto */}
                <div className="editar-section">
                  <h3 className="editar-section-title">
                    📞 Información de Contacto
                  </h3>
                  <div className="contacto-grid">
                    <div className="input-group">
                      <label className="input-label">Email Principal</label>
                      <input 
                        type="email"
                        value={formData.email}
                        disabled
                        className="input-disabled"
                      />
                      <small style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                        El email no se puede modificar
                      </small>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Teléfono Móvil</label>
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        onKeyDown={handlePhoneKeyDown}
                        onFocus={handlePhoneFocus}
                        onClick={handlePhoneClick}
                        placeholder={`${PHONE_PREFIX} XXXX XXXX`}
                        className="input"
                      />
                      <small style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                        Formato automático: +56 9 XXXX XXXX
                      </small>
                    </div>
                  </div>
                </div>

                {/* Seguridad */}
                <div className="editar-section">
                  <h3 className="editar-section-title">
                    🔒 Seguridad de la Cuenta
                  </h3>
                  
                  <div className="security-card">
                    <h4>Contraseña Segura</h4>
                    <p>
                      Para proteger tu cuenta, te recomendamos cambiar tu contraseña regularmente. 
                      Dirígete a la sección de seguridad para actualizar tu contraseña.
                    </p>
                    <Link href="/usuario/seguridad" className="btn-security">
                      🔑 Configurar Seguridad
                    </Link>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Contraseña Actual</label>
                    <input 
                      type="password"
                      value="************"
                      disabled
                      className="input-disabled"
                    />
                    <small style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                      La contraseña solo se puede cambiar desde la sección de seguridad
                    </small>
                  </div>
                </div>

                {/* Biografía */}
                <div className="editar-section">
                  <h3 className="editar-section-title">
                    💬 Sobre mí
                  </h3>
                  
                  <p className="bio-description">
                    Cuéntanos sobre ti, tus intereses deportivos, o cualquier otra información 
                    que desees compartir con la comunidad de SportHub.
                  </p>

                  <div className="input-group">
                    <label className="input-label">Biografía</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="textarea"
                      placeholder="Escribe tu biografía aquí..."
                      maxLength={500}
                      rows={6}
                    />
                    <div className="char-count">
                      {formData.bio?.length || 0}/500 caracteres
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit"
                      onClick={handleSubmit}
                      className="btn-save"
                      disabled={isLoading}
                    >
                      {isLoading ? "💾 Guardando..." : "💾 Guardar Cambios"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UserLayout>
    </div>
  );
}