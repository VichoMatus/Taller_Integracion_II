"use client";

import { useState } from "react";
import "./seguridad.css";

export default function SeguridadPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [allowEmails, setAllowEmails] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    console.log("Nueva contraseña guardada:", password);
  };

  return (
    <div className="seguridad-page">
      <h1 className="titulo-pagina">Seguridad de la Cuenta</h1>

      {/* 🔲 Bloque principal */}
      <div className="bloque-principal">
        {/* 🔄 Contenedor flex para dos columnas */}
        <div className="contenedor-flex">
          {/* 📌 Sección izquierda */}
          <div className="seccion-izquierda subcard">
            <h2 className="titulo-seccion">Cambiar Tu Contraseña</h2>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <p className="texto-secundario">
                A la hora de cambiar tu contraseña te recomendamos lo siguiente:
              </p>

              <input
                type="password"
                placeholder="Nueva Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-text"
              />

              <ul className="requisitos">
                <li>Longitud: Mínimo 8 caracteres.</li>
                <li>
                  Mayúsculas y minúsculas: Al menos una letra mayúscula y una
                  minúscula.
                </li>
                <li>
                  Números y símbolos: Al menos un número y un símbolo (como !, @,
                  #, $, %).
                </li>
                <li>Evita: Contraseñas comunes o fáciles de adivinar.</li>
              </ul>

              <input
                type="password"
                placeholder="Vuelve a Introducir tu Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-text"
              />

              <button type="submit" className="btn-rojo">
                Cambiar Contraseña
              </button>
            </form>
          </div>

          {/* 📌 Sección derecha */}
          <div className="seccion-derecha subcard">
            <h2 className="titulo-seccion">Seguridad</h2>
            <p className="texto-secundario">
              Bienvenido al apartado de la Seguridad aquí se mostrará el registro
              de cada vez que inicies sesión y la cierres, con el propósito de que
              al notar que alguno de los registros no seas tú te comuniques lo
              antes posible con un administrador.
            </p>

            <div className="registro">
              <p>[Día: 01-01 Hora:12:00] Sesión Iniciada</p>
              <p>[Día: 01-01 Hora:12:25] Sesión Cerrada</p>
              <p>[Día: 01-01 Hora:18:13] Sesión Iniciada</p>
              <p>[Día: 01-01 Hora:19:51] Sesión Cerrada</p>
              <p>[Día: 01-02 Hora:01:48] Sesión Iniciada</p>
            </div>

            <div className="correo-autorizacion">
              <input
                type="checkbox"
                checked={allowEmails}
                onChange={() => setAllowEmails(!allowEmails)}
                className="checkbox"
              />
              <span>Autorizar correos informativos</span>
              <button type="button" className="btn-rojo px-4 py-1 text-sm">
                Actualizar
              </button>
            </div>

            <button className="btn-azul">Contactar a Un Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
