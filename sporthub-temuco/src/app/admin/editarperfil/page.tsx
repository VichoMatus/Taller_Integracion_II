'use client';

import './editarperfil.css';
import React from 'react';
import Layout from '@/components/layout/AdminsLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function EditarPerfilAdministrador() {
  const router = useRouter();
  const userName = "Administrador";

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <Layout userRole="admin" userName="Administrador">
      <div className="edit-profile-container">
        <div className="edit-profile-card">
          {/* Columna izquierda */}
          <div className="profile-sidebar">
            <div className="avatar-section">
              <div className="avatar-edit-container">
                <div className="avatar-edit">
                  <span className="avatar-initial">{getInitial(userName)}</span>
                </div>
                <div className="online-status"></div>
              </div>

              <h2 className="profile-name">{userName}</h2>
            </div>

            <Button className="change-photo-btn" onClick={() => alert('Cambiar Foto')}>
              Cambiar Foto
            </Button>

            <div className="info-notice">
              <p>
                Hola Administrador, te recordamos que tus datos son de suma importancia, es por eso que el{' '}
                <span className="highlight-text">Correo Electrónico</span>{' '}
                no se puede modificar ya que ese es su dato clave que los vuelve administradores.
              </p>
            </div>

            <Button className="back-profile-btn" onClick={() => router.push('/admin/perfil')}>
              ← Volver al Perfil
            </Button>
          </div>

          {/* Columna derecha */}
          <div className="profile-edit-form">
            <div className="form-container">
              <h1 className="form-title">Editar Perfil Administrador</h1>
              
              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label">Nombre</label>
                  <Input placeholder="Nombre Administrador" name="nombre" />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Número de Teléfono</label>
                  <Input placeholder="Número Telefónico" name="telefono" />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Edad</label>
                  <Input placeholder="Ingrese su Edad" name="edad" type="number" />
                </div>
                
                <div className="input-group full-width">
                  <Button
                    className="change-password-btn"
                    onClick={() => router.push('/admin/cambiocontra')}
                  >
                    🔒 Cambiar Contraseña
                  </Button>
                </div>

                <div className="input-group full-width">
                  <label className="input-label">Correo Electrónico</label>
                  <Input
                    value="correoAdministrador241@gmail.com"
                    disabled
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button className="save-changes-btn" onClick={() => alert('Guardar Cambios')}>
                  💾 Guardar Cambios
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}