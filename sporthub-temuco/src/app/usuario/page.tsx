export default function PerfilPage() {
  return (
    <div className="profile-card">
      {/* Columna izquierda: perfil */}
      <div className="profile-left">
        <img src="/usuario/perro.jpg" alt="Usuario" />
        <h2>Perro Inteligente</h2>
        <p>Usuario</p>

        <div className="profile-details">
          <div><span>Ubicación</span><span>Padre Las Casas</span></div>
          <div><span>Número de Teléfono</span><span>+569 28102374</span></div>
          <div><span>Correo</span><span>Usuario@gmail.com</span></div>
          <div><span>Deporte favorito</span><span style={{ color: "green" }}>Fútbol</span></div>
          <div><span>Edad</span><span>28</span></div>
        </div>

        <button className="edit-btn">Editar Perfil</button>
      </div>

      {/* Columna derecha: info y reservas */}
      <div className="profile-right">
        <div className="info-box">
          <h3>Información del Usuario</h3>
          <p>
            Me gusta jugar a la pelota y ando en busca de una buena aplicación web
            para poder reservar canchas para jugar a la pelota.
          </p>
        </div>

        <div className="reservas-box">
          <h3>Últimas Reservas Activas</h3>
          <div className="reservas-grid">
            <div className="reserva-card">
              <img src="/usuario/cancha.jpg" alt="Reserva" />
              <p><b>Fútbol 7 - Club Centro</b></p>
              <p>Av. Principal 123</p>
              <p>Horario: 10:00 - 11:00</p>
              <p>Fecha: 08 Junio 2025</p>
              <button className="reserva-btn">Ir a Reservas</button>
            </div>
            <div className="reserva-card">
              {/* Otra reserva futura */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
