'use client';


import './formulario-contrase.css';
import React, { useState } from "react";
import { Input, Button } from "../componentes/compUser";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setError("");
    alert("Contraseña cambiada exitosamente");
  };

  return (
    <form onSubmit={handleSubmit} className="change-password-form">
      <h2>Cambiar Contraseña</h2>

      <div>
        <label>Contraseña Actual</label>
        <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Ingrese su contraseña actual"/>
      </div>

      <div>
        <label>Nueva Contraseña</label>
        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Ingrese la nueva contraseña"/>
      </div>

      <div>
        <label>Confirmar Nueva Contraseña</label>
        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme la nueva contraseña" error={!!error}/>
        {error && <p className="error">{error}</p>}
      </div>

      <Button type="submit" variant="primary" className="primary">Cambiar Contraseña</Button>
    </form>
  );
}
