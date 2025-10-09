'use client';

import './perfil.css';
import React, { useState, useEffect } from 'react';
import UserLayout from '../UsuarioLayout';
import Link from 'next/link';

export default function PerfilUsuario() {
  const [reservasExpandidas, setReservasExpandidas] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const userData = {
    name: "Usuario",
    location: "Padre Las Casas",
    phone: "+569 28102374",
    email: "Usuario@gmail.com", 
    sport: undefined, // ✅ CORREGIDO: usar : en lugar de =
    age: "28",
    gender: "Masculino"
  };

  const userInitial = userData.name.charAt(0).toUpperCase();

  const reservas = [
    {
      id: 1,
      cancha: "Fútbol 7 - Club Centro",
      direccion: "Av. Principal 123",
      horario: "10:00 - 11:00",
      fecha: "08 Junio 2025",
      imagen: "/usuario/cancha.jpg",
      detalles: {
        estado: "Confirmada",
        precio: "$25.000",
        jugadores: "14/14",
        duracion: "1 hora",
        codigo: "RES-2025-001"
      }
    },
    {
      id: 2,
      cancha: "Fútbol 5 - Parque Deportivo",
      direccion: "Calle Secundaria 456",
      horario: "16:00 - 17:00", 
      fecha: "10 Junio 2025",
      imagen: "/usuario/cancha2.jpg",
      detalles: {
        estado: "Pendiente de pago",
        precio: "$18.000",
        jugadores: "10/10",
        duracion: "1 hora",
        codigo: "RES-2025-002"
      }
    }
  ];

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleDetalles = (id: number) => {
    setReservasExpandidas(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <UserLayout userName={userData.name} notificationCount={2}> {/* ✅ Sin sport */}
        <div className="perfil-wrapper">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <div id="tailwind-wrapper">
      <UserLayout userName={userData.name} notificationCount={2}> {/* ✅ Sin sport */}
        <div className="perfil-wrapper">
          {/* Título a la izquierda como en las otras páginas */}
          <div className="perfil-header">
            <h1 className="perfil-titulo">Perfil de Usuario</h1>
            <p className="perfil-subtitulo">Gestiona tu información y reservas</p>
          </div>

          <div className="profile-card">
            <div className="profile-left">
              <div className="avatar-iniciales">
                <span>{userInitial}</span>
              </div>

              <h2>{userData.name}</h2>
              <p>Usuario</p>

              <div className="profile-details">
                <div><span>Ubicación</span><span>{userData.location}</span></div>
                <div><span>Teléfono</span><span>{userData.phone}</span></div>
                <div><span>Correo</span><span>{userData.email}</span></div>
                <div><span>Deporte favorito</span><span style={{ color: 'green' }}>{userData.sport || 'No especificado'}</span></div>
                <div><span>Edad</span><span>{userData.age}</span></div>
                <div><span>Género</span><span>{userData.gender}</span></div>
              </div>

              <Link href="/usuario/editarperfil">
                <button className="edit-btn">Editar Perfil</button>
              </Link>
            </div>

            <div className="profile-right">
              <div className="info-box">
                <h3>Información del Usuario</h3>
                <p>Me gusta jugar a la pelota y ando en busca de una buena aplicación web para poder reservar canchas.</p>
              </div>

              <div className="reservas-box">
                <h3>Últimas Reservas Activas</h3>
                <div className="reservas-grid">
                  {reservas.map((reserva) => (
                    <div key={reserva.id} className="reserva-card">
                      <img src={reserva.imagen} alt={reserva.cancha} />
                      <p><b>{reserva.cancha}</b></p>
                      <p>{reserva.direccion}</p>
                      <p>Horario: {reserva.horario}</p>
                      <p>Fecha: {reserva.fecha}</p>
                      
                      <button className="reserva-btn" onClick={() => toggleDetalles(reserva.id)}>
                        {reservasExpandidas.includes(reserva.id) ? 'Ocultar' : 'Ver Detalles'}
                      </button>

                      {reservasExpandidas.includes(reserva.id) && (
                        <div className="detalles-reserva">
                          <div className="detalles-header">
                            <h4>Detalles de la Reserva</h4>
                            <span className={`estado ${reserva.detalles.estado.replace(' ', '-').toLowerCase()}`}>
                              {reserva.detalles.estado}
                            </span>
                          </div>
                          
                          <div className="detalles-grid">
                            <div><span>Código:</span><span>{reserva.detalles.codigo}</span></div>
                            <div><span>Precio:</span><span>{reserva.detalles.precio}</span></div>
                            <div><span>Jugadores:</span><span>{reserva.detalles.jugadores}</span></div>
                            <div><span>Duración:</span><span>{reserva.detalles.duracion}</span></div>
                          </div>
                          
                          <div className="detalles-actions">
                            <Link href="/usuario/reservas">
                              <button className="btn-ir-reservas">Ir a Mis Reservas</button>
                            </Link>
                            <button className="btn-cancelar">Cancelar Reserva</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </UserLayout>
    </div>
  );
}