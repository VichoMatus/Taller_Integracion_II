'use client';

import React, { useState, useEffect } from "react";
import "./editar_perfil.css";
import { Input, Button } from "../componentes/compUser";
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

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await authService.me();
        setFormData({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          phone: data.telefono || "",
          email: data.email,
          bio: data.bio || "",
          avatar: data.avatar_url || null,
        });
      } catch {
        // Si falla, deja los campos vacíos
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

  const handleChangePhoto = () => {
    alert("Funcionalidad para cambiar foto (a implementar)");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      // Prepara el payload con los campos que acepte la API
      const updatePayload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.phone,
        // El campo 'bio' está definido en UserUpdateRequest
        //bio: formData.bio
      };

      await authService.updateProfile(updatePayload);
      setSuccess("Perfil actualizado correctamente");
      
      // Esperar 2 segundos y redirigir al perfil
      setTimeout(() => {
        router.push("/usuario/perfil");
      }, 2000);
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error);
      setError(error.message || "Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const fullName = `${formData.nombre} ${formData.apellido}`.trim();

  return (
    <UserLayout userName={fullName} notificationCount={2}>
      <div className="editar-perfil-wrapper">
        <div className="editar-perfil-header">
          <h1 className="editar-perfil-titulo">Editar Perfil</h1>
          <p className="editar-perfil-subtitulo">Actualiza tu información personal</p>
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

        <form onSubmit={handleSubmit} className="profile-grid">
          {/* Columna izquierda - Foto y datos básicos */}
          <div className="profile-left">
            <div className="avatar-section">
              <div className="avatar-iniciales-editar">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" />
                ) : (
                  <span>{formData.nombre.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <Button onClick={handleChangePhoto} className="btn-change-photo w-full">
                Cambiar Foto
              </Button>
            </div>

            <div className="input-group">
              <label className="input-label">Nombre</label>
              <Input 
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre" 
                className="input" 
              />
            </div>

            <div className="input-group">
              <label className="input-label">Apellido</label>
              <Input 
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Apellido" 
                className="input" 
              />
            </div>

            <Link href="/usuario/perfil" className="btn-back w-full text-center">
              ← Volver a Perfil
            </Link>
          </div>

          {/* Columna central - Contacto y seguridad */}
          <div className="profile-center">
            <div className="input-group">
              <label className="input-label">Teléfono</label>
              <Input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Número Telefónico" 
                className="input" 
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Correo electrónico</label>
              <Input 
                type="email" 
                name="email"
                value={formData.email}
                disabled
                className="input-disabled" 
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Contraseña</label>
              <Input 
                type="password" 
                defaultValue="************" 
                disabled 
                className="input-disabled" 
              />
            </div>

            <p className="password-info">
              Para cambiar la contraseña, ve al apartado de{" "}
              <Link href="/usuario/seguridad" className="link">
                Seguridad
              </Link>
              , ahí encontrarás los pasos a seguir.
            </p>

            <Link href="/usuario/seguridad" className="btn-security">
              Configurar Seguridad
            </Link>
          </div>

          {/* Columna derecha - Biografía */}
          <div className="profile-right">
            <div className="input-group">
              <label className="input-label">Biografía</label>
              <p className="input-description">
                Aqui podras escribir sobre ti, tus intereses deportivos, o cualquier otra información que desees compartir con la comunidad de SportHub.
              </p>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="textarea"
                rows={6}
                placeholder="Cuéntanos sobre ti..."
                maxLength={500}
              />
              
              <div className="char-count">
                {formData.bio?.length || 0}/500 caracteres
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="form-actions">
            <Button 
              type="submit" 
              className="btn-save" 
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}
