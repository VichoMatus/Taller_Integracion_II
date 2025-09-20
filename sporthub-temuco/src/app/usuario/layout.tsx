import "./usuario.css";
import React, { ReactNode } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import Sidebar from "../../components/layout/Sidebar";

type UsuarioLayoutProps = {
  children: ReactNode;
  userName?: string;
  notificationCount?: number;
};

export default function UsuarioLayout(props: UsuarioLayoutProps) {
  const {
    children,
    userName = "Usuario",
    notificationCount = 0,
  } = props;

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <Sidebar userRole="usuario" />
      </aside>

      {/* Contenido principal */}
      <div className="main">
        <Header
          userName={userName}
          userRole="usuario"
          notificationCount={notificationCount}
        />
        <main>{children}</main>
        <Footer variant="full" supportHref="/ayuda" className="usuario"/>
      </div>
    </div>
  );
}