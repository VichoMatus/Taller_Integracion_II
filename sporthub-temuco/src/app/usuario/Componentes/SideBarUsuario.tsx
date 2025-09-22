export default function SideBarUsuario() {
  return (
    <nav
      className="h-screen flex flex-col justify-between"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "240px",
        background: "#5a6993",
        zIndex: 50,
      }}
    >
      <div>
        <div className="flex flex-col items-center mt-6">
          <h2 className="text-2xl font-bold">SportHub</h2>
          <span className="text-base font-medium text-gray-400">Usuario</span>
        </div>


        <ul className="space-y-4 ml-6">
          <li>⚽ Reservas</li>
          <li>👥 Equipos</li>
          <li>👤 Perfil</li>
          <li>🔒 Seguridad</li>
          <li>✉️ Mensajería</li>
        </ul>
      </div>
      <ul className="mb-4 ml-6">
        <li>🚪 Cerrar Sesión</li>
      </ul>
    </nav>
  );
}