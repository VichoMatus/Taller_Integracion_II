'use client';

import './editarperfil.css';
import React from 'react';
import Layout from '@/components/layout/AdminsLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function EditarPerfilAdministrador() {
  return (
    <Layout userRole="admin" userName="Administrador">
      <div className="page-wrapper">
        <div className="profile-card">
          {/* Columna izquierda */}
          <div className="profile-left">
            <div className="foto-circle">
              <span>👤</span>
            </div>

            <h2>Administrador</h2>
            <p>Administrador</p>

            <div className="profile-details">
              <div>
                <span>Número de Teléfono</span>
                <span>+569 00000000</span>
              </div>
              <div>
                <span>Edad</span>
                <span>35</span>
              </div>
              <div>
                <span>Correo</span>
                <span>correoAdministrador241@gmail.com</span>
              </div>
            </div>

            <Button className="edit-btn" onClick={() => alert('Cambiar Foto')}>
              Cambiar Foto
            </Button>

            <Button className="edit-btn" onClick={() => alert('Volver al Perfil')}>
              Volver al Perfil
            </Button>
          </div>

          {/* Columna derecha */}
          <div className="profile-right">
            {/* Tarjeta del info-box */}
            <div className="info-box">
              <h3>Información</h3>
              <p>
                Recuerda que tu <strong>correo electrónico</strong> es clave y no se puede modificar.
              </p>
            </div>

            {/* Tarjeta del formulario */}
            <div className="form-card">
              <h3>Editar Información</h3>
              <Input
                label="Nombre"
                placeholder="Nombre Administrador"
                name="nombre"
              />
              <Input
                label="Número de Teléfono"
                placeholder="Número Telefonico"
                name="telefono"
              />
              <Input
                label="Edad"
                placeholder="Edad"
                name="edad"
                type="number"
              />

              <div className="password-row">
                <Input
                  label="Contraseña"
                  placeholder="********"
                  name="password"
                  type="password"
                />
                <Button className="btn-red" onClick={() => alert('Cambiar Contraseña')}>
                  Cambiar Contraseña
                </Button>
              </div>

              <div className="action-buttons">
                <Button className="btn-green" onClick={() => alert('Guardar Cambios')}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
