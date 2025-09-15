export default function FooterUsuario() {
  return (
    <footer
      className="text-center text-sm text-gray-500 py-4"
      style={{
        position: "fixed",
        left: "240px", // Ajusta este valor al ancho de tu sidebar
        bottom: 0,
        width: "calc(100% - 240px)", // Resta el ancho del sidebar
        background: "#EEF2F1",
        zIndex: 40,
      }}
    >
      © 2025 SportHub - Todos los derechos reservados
    </footer>
  );
}