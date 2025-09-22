import "./usuario.css";
import React from "react";
import SideBarUsuario from "./Componentes/SideBarUsuario";
import HeaderUsuario from "./Componentes/HeaderUsuario";
import FooterUsuario from "./Componentes/FooterUsuario";

export default function UsuarioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <SideBarUsuario />
      </aside>

      {/* Contenido principal */}
      <div className="main">
        <HeaderUsuario />
        <main>{children}</main>
        <FooterUsuario />
      </div>
    </div>
  );
}
