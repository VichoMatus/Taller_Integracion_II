'use client';

import './editarperfil.css';
import React from 'react';
import Layout from '@/components/layout/AdminsLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function EditarPerfilAdministrador() {
  const router = useRouter();

  return (
    <Layout userRole="admin" userName="Administrador">
      <div className="page-wrapper">
        <div className="profile-card">
          {/* Columna izquierda */}
          <div className="profile-left">
            <div className="foto-circle">
              <img
                src="https://placedog.net/200/200?id=12"
                alt="Foto de perfil"
                className="avatar-img"
              />
            </div>

            <Button className="edit-btn" onClick={() => alert('Cambiar Foto')}>
              Cambiar Foto
            </Button>

            <div className="info-box-small">
              <p>
                Hola Administrador, te recordamos que tus datos son de suma importancia, es por eso que el{' '}
                <span style={{ color: 'purple', fontWeight: 'bold' }}>
                  Correo Electrónico
                </span>{' '}
                no se puede modificar ya que ese es su dato clave que los vuelve administradores
              </p>
            </div>

            <Button className="edit-btn-orange" onClick={() => router.push('http://localhost:3000/admin/perfil')}>
              Volver al Perfil
            </Button>
          </div>

          {/* Columna derecha */}
          <div className="profile-right">
            <div className="form-card">
              <h1>Editar Perfil Administrador</h1>
              <Input label="Nombre  " placeholder="Nombre Administrador" name="nombre" />
              <Input label="Número de Teléfono" placeholder="Número Telefonico" name="telefono" />
              <Input label="Edad  " placeholder="Ingrese su Edad" name="edad" type="number" />

              <Button
                className="btn-red btn-full"
                onClick={() => router.push('admin/cambioContra')}
              >
                Cambiar Contraseña
              </Button>

              <Input
                label="Correo Electrónico"
                value="correoAdministrador241@gmail.com"
                disabled
              />

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
