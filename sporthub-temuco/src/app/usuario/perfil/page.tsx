'use client';

import './perfil.css';
import React, { useState, useEffect } from 'react';
import UserLayout from '../UsuarioLayout';
import Link from 'next/link';
import authService from '@/services/authService';
import { useAuthProtection } from '@/hooks/useAuthProtection';

export default function PerfilUsuario() {
  // Protección de ruta - solo usuarios pueden acceder
  useAuthProtection(['usuario']);
  
  const [reservasExpandidas, setReservasExpandidas] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

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

  // Función para cargar los datos del usuario
  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const data = await authService.me();
      // Asegura que todos los datos se actualicen desde la API
      setUserData({
        id_usuario: data.id_usuario,
        name: `${data.nombre} ${data.apellido}`,
        nombre: data.nombre,
        apellido: data.apellido,
        phone: data.telefono || "No registrado",
        email: data.email,
        avatar: data.avatar_url,
        rol: data.rol,
        bio: data.bio || "",
        esta_activo: data.esta_activo,
        verificado: data.verificado
      });
      console.log("Datos de usuario actualizados:", data);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar datos cada vez que se monta la página
    loadUserData();

    // Si quisieras recargar datos cuando el usuario vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUserData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Limpiar event listener al desmontar
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Dependencias vacías para que solo se ejecute al montar

  const userInitial = userData?.name ? userData.name.charAt(0).toUpperCase() : "U";

  const toggleDetalles = (id: number) => {
    setReservasExpandidas(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <UserLayout userName={userData?.name || "Usuario"} notificationCount={2}>
        <div className="perfil-wrapper">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!userData) {
    return (
      <UserLayout userName="Usuario" notificationCount={2}>
        <div className="perfil-wrapper">
          <div className="loading-spinner">
            <p>No se pudo cargar el perfil.</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <div id="tailwind-wrapper">
      <UserLayout userName={userData.name} notificationCount={2}>
        <div className="perfil-wrapper">
          <div className="perfil-header">
            <h1 className="perfil-titulo">Perfil de Usuario</h1>
            <p className="perfil-subtitulo">Gestiona tu información y reservas</p>
          </div>

          <div className="profile-card">
            <div className="profile-left">
              <div className="avatar-iniciales">
                {userData.avatar ? (
                  <img src={userData.avatar} alt="Avatar" />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>

              <h2>{userData.name}</h2>
              <p>{userData.rol ? userData.rol.charAt(0).toUpperCase() + userData.rol.slice(1) : "Usuario"}</p>

              <div className="profile-details">
                <div><span>ID Usuario</span><span>{userData.id_usuario}</span></div>
                <div><span>Nombre</span><span>{userData.nombre}</span></div>
                <div><span>Apellido</span><span>{userData.apellido}</span></div>
                <div><span>Teléfono</span><span>{userData.phone}</span></div>
                <div><span>Correo</span><span>{userData.email}</span></div>
                <div><span>Rol</span><span>{userData.rol}</span></div>
              </div>

              <Link href="/usuario/editarperfil">
                <button className="edit-btn">Editar Perfil</button>
              </Link>
            </div>

            <div className="profile-right">
              <div className="info-box">
                <h3>Información del Usuario</h3>
                {userData.bio ? (
                  <p>{userData.bio}</p>
                ) : (
                  <p className="bio-placeholder">
                    Hola {userData.nombre}, bienvenido a tu perfil. Aquí podrás ver y gestionar toda tu información personal y tus reservas activas. Te invitamos a completar tu biografía para que otros usuarios puedan conocerte mejor.
                    <br /><br />
                  </p>
                )}
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