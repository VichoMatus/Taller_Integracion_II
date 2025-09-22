'use client';

import './seguridad.css';
import React, { useState } from 'react';
import { Input, Button } from '../componentes/compUser';
import UserLayout from '../UsuarioLayout';

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
    <UserLayout
      userName="Usuario"
      sport="futbol"
      notificationCount={2}
    >
      {/* Wrapper para considerar header y sidebar */}
      <div className="page-wrapper seguridad-wrapper">
        <h1 className="titulo-principal">Seguridad de la Cuenta</h1>

        <div className="bloque-principal">
          <div className="contenedor-flex">

            {/* Sección izquierda */}
            <div className="seccion-izquierda subcard">
              <h2 className="titulo-seccion">Cambiar Tu Contraseña</h2>

              <form onSubmit={handleChangePassword} className="flex flex-col gap-4 items-center">
                <p className="texto-secundario text-center">
                  Aqui podras cambiar tu contraseña, deberas ingresar tu contraseña actual y luego la nueva contraseña
                </p>

                <div className="w-full max-w-sm mx-auto">
                  <Input
                    type="password"
                    placeholder="Contraseña Actual"
                    className="input-text w-full"
                  />
                </div>

                <div className="w-full max-w-sm mx-auto">
                  <Input
                    type="password"
                    placeholder="Nueva Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-text w-full"
                  />
                </div>

                <ul className="requisitos text-left">
                  <p>Estos son algunos de los requisitos minimos que debe cumplir tu contraseña</p>
                  <li>Longitud: Mínimo 8 caracteres.</li>
                  <li>Mayúsculas y minúsculas: Al menos una letra mayúscula y una minúscula.</li>
                  <li>Números y símbolos: Al menos un número y un símbolo (!, @, #, $, %).</li>
                  <li>Evita: Contraseñas comunes o fáciles de adivinar.</li>
                </ul>

                <div className="w-full max-w-sm mx-auto">
                  <Input
                    type="password"
                    placeholder="Vuelve a Introducir tu Contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-text w-full"
                  />
                </div>

                <div className="w-full max-w-sm mx-auto flex justify-center">
                  <Button type="submit" variant="primary" className="btn-rojo w-full">
                    Cambiar Contraseña
                  </Button>
                </div>
              </form>
            </div>

            {/* Sección derecha */}
            <div className="seccion-derecha subcard">
              <h2 className="titulo-seccion">Seguridad</h2>
              <p className="texto-secundario">
                Bienvenido al apartado de la Seguridad aquí se mostrará el registro
                de cada vez que inicies sesión y la cierres.
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
                <span>Autorizar correos informativos hacia Correous*********.com</span>
                <Button variant="secondary" className="btn-rojo px-4 py-1 text-sm">
                  Actualizar
                </Button>
              </div>
              <p>Al marcar esta casilla significa que habilitaras que los correos informativos lleguen a tu direccion de correo</p>

              <Button variant="primary" className="btn-azul">
                Contactar a Un Admin
              </Button>
            </div>

          </div>
        </div>
      </div>
    </UserLayout>
  );
}
