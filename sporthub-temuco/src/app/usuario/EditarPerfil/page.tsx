"use client";
import React, { useState } from "react";
import "./editar_perfil.css";
import { Input, Button } from "../componentes/compUser";

export default function EditarPerfilPage() {
  const [selectedSport, setSelectedSport] = useState("");
  const handleChangePhoto = () => {
    alert("Funcionalidad para cambiar foto (a implementar)");
  };

  // Función que retorna la clase de color según el deporte seleccionado
  const getSportColor = () => {
    switch (selectedSport) {
      case "futbol":
        return "text-green-600";
      case "basket":
        return "text-orange-600";
      case "tenis":
        return "text-blue-600";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Editar Perfil</h2>

      {/* Grid principal con clase personalizada */}
      <div className="profile-grid">
        {/* Columna izquierda */}
        <div className="profile-left">
          <img
            src="https://placedog.net/200/200?id=12"
            alt="Foto de perfil"
            className="profile-photo"
          />

          <Button
            onClick={handleChangePhoto}
            className="btn-change-photo w-full"
          >
            Cambiar Foto
          </Button>

          <Input placeholder="Nombre Usuario" className="input" />

          {/* Select con color dinámico */}
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className={`input ${getSportColor()}`}
          >
            <option value="">Selecciona un deporte</option>
            <option value="futbol" className="text-green-600">Fútbol</option>
            <option value="basket" className="text-orange-600">Basketball</option>
            <option value="tenis" className="text-blue-600">Tenis</option>
          </select>

          <Input type="number" placeholder="Edad" className="input-small" />

          <Button variant="secondary" className="btn-back w-full">
            <a href="http://localhost:3000/usuario/perfil" className="font-bold text-blue-600 no-underline hover:underline">Volver a Perfil</a>

          </Button>
        </div>

        {/* Columna central */}
        <div className="profile-center">
          <Input
            type="tel"
            placeholder="Número Telefónico"
            defaultValue="+56 9"
            className="input"
          />
          <Input
            type="email"
            defaultValue="CorreoUsuario@gmail.com"
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
            <a href="http://localhost:3000/usuario/seguridad" className="link font-bold">Seguridad</a>, ahí encontrarás los pasos a seguir para modificar estos datos.
          </p>

          <Button variant="primary" className="btn-security">
            <a href="http://localhost:3000/usuario/seguridad" className="font-bold text-blue-600 no-underline hover:underline">Seguridad</a>
          </Button>
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

      {/* Botón de Guardar */}
      <div className="flex justify-end mt-5">
        <Button className="btn-save">Guardar Cambios</Button>
      </div>
    </div>
  );
}
