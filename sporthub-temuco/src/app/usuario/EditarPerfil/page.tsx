"use client";
import React from "react";
import "./editar_perfil.css"; // 👈 Importa el CSS que hicimos

export default function EditarPerfilPage() {
  const handleChangePhoto = () => {
    alert("Funcionalidad para cambiar foto (a implementar)");
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Editar Perfil</h2>

      <div className="profile-grid">
        {/* Columna izquierda */}
        <div className="profile-left">
          <img src="https://placedog.net/200/200?id=12" alt="Foto de perfil" className="profile-photo" />

          <button onClick={handleChangePhoto} className="btn-change-photo">
            Cambiar Foto
          </button>

          <input type="text" placeholder="Nombre Usuario" className="input" />
          <input type="text" placeholder="Deporte Favorito" className="input" />
          <input type="number" placeholder="Edad" className="input-small" />

          <button className="btn-back">Volver a Perfil</button>
        </div>

        {/* Columna central */}
        <div className="profile-center">
          <input
            type="tel"
            placeholder="Número Telefónico"
            defaultValue="+569 28102374"
            className="input"
          />
          <input
            type="email"
            defaultValue="CorreoUsuario@gmail.com"
            disabled
            className="input-disabled"
          />
          <input
            type="password"
            defaultValue="************"
            disabled
            className="input-disabled"
          />

          <p className="password-info">
            Para realizar el cambio de contraseña se debe realizar en el
            apartado de <a href="/Seguridad" className="link">Seguridad</a>, ahí encontrarás
            los pasos a seguir para modificar estos datos.
          </p>

          <button type="button" className="btn-security">
            Ir a Seguridad
          </button>
        </div>

        {/* Columna derecha */}
        <div className="profile-right">
          <label className="textarea-label">Escribe tu información:</label>
          <textarea
            className="textarea"
            defaultValue="Me gusta jugar a la pelota y ando en busca de una buena aplicación web para poder reservar canchas para jugar a la pelota."
          />
        </div>
      </div>
          <button type="button" className="btn-save">
            Guardar Cambios
          </button>
    </div>
  );
}
