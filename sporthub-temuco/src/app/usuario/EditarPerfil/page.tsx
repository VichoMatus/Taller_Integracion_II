'use client';

import React, { useState } from "react";
import "./editar_perfil.css";
import { Input, Button } from "../componentes/compUser";
import Link from "next/link";
import UserLayout from "../UsuarioLayout";

// Definición del tipo SportType para los deportes (los mismos del Sidebar)
type SportType = 'futbol' | 'tenis' | 'basquetbol' | 'voleibol' | 'padel' | undefined;

export default function EditarPerfil() {
  const [formData, setFormData] = useState({
    name: "Usuario",
    phone: "+569 28102374",
    email: "Usuario@gmail.com",
    sport: "futbol" as SportType,
    age: "28",
    location: "Padre Las Casas",
    bio: "Me gusta jugar a la pelota y ando en busca de una buena aplicación web para poder reservar canchas.",
    gender: "Masculino"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value as SportType
    });
  };

  const handleChangePhoto = () => {
    alert("Funcionalidad para cambiar foto (a implementar)");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos actualizados:', formData);
    alert('Perfil actualizado correctamente');
  };

  const getSportColor = () => {
    switch (formData.sport) {
      case "futbol":
        return "text-green-600";
      case "basquetbol":
        return "text-orange-600";
      case "tenis":
        return "text-blue-600";
      case "voleibol":
        return "text-purple-600";
      case "padel":
        return "text-red-600";
      default:
        return "text-gray-700";
    }
  };

  return (
    <UserLayout userName={formData.name} sport={formData.sport} notificationCount={2}>
      <div className="editar-perfil-wrapper">
        {/* Título a la izquierda como en Reservas */}
        <div className="editar-perfil-header">
          <h1 className="editar-perfil-titulo">Editar Perfil</h1>
          <p className="editar-perfil-subtitulo">Actualiza tu información personal</p>
        </div>

          <form onSubmit={handleSubmit} className="profile-grid">
            {/* Columna izquierda - Foto y datos básicos */}
            <div className="profile-left">
              <div className="avatar-section">
                <div className="avatar-iniciales-editar">
                  <span>{formData.name.charAt(0).toUpperCase()}</span>
                </div>
                <Button onClick={handleChangePhoto} className="btn-change-photo w-full">
                  Cambiar Foto
                </Button>
              </div>

              <Input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre Usuario" 
                className="input" 
              />

              <select
                name="sport"
                value={formData.sport || ""}
                onChange={handleChange}
                className={`input ${getSportColor()}`}
              >
                <option value="">Selecciona tu deporte Favorito</option>
                <option value="futbol" className="text-green-600">Fútbol</option>
                <option value="basquetbol" className="text-orange-600">Basketball</option>
                <option value="tenis" className="text-blue-600">Tenis</option>
                <option value="voleibol" className="text-purple-600">Vóleibol</option>
                <option value="padel" className="text-red-600">Pádel</option>
              </select>

              <div className="form-row">
                <Input 
                  type="number" 
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Edad" 
                  className="input-small" 
                />
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input input-small"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <Input 
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ubicación" 
                className="input" 
              />

              <Link href="/usuario/perfil" className="btn-back w-full text-center">
                ← Volver a Perfil
              </Link>
            </div>

            {/* Columna central - Contacto y seguridad */}
            <div className="profile-center">
              <Input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Número Telefónico" 
                className="input" 
              />
              
              <Input 
                type="email" 
                name="email"
                value={formData.email}
                disabled
                className="input-disabled" 
              />
              
              <Input 
                type="password" 
                defaultValue="************" 
                disabled 
                className="input-disabled" 
              />

              <p className="password-info">
                Para realizar el cambio de contraseña se debe realizar en el apartado de{" "}
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
              <label className="textarea-label">Información personal</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="textarea"
                rows={6}
                placeholder="Cuéntanos sobre ti..."
              />
              
              <div className="char-count">
                {formData.bio.length}/500 caracteres
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="form-actions">
              <Button type="submit" className="btn-save">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
    </UserLayout>
  );
}