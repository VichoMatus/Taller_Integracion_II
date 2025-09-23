"use client";

import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminsLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import "./cambiocontra.css";

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const handleGuardar = () => {
    if (!password || !confirmar) {
      alert("Debes completar todos los campos.");
      return;
    }
    if (password !== confirmar) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    alert("Contraseña actualizada correctamente ✅");
    // Aquí puedes llamar a tu API
  };

  return (
    <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
    <div className="admin-layout">
        <div className="nueva-container">
            <div className="nueva-card">
            <h2 className="titulo">Nueva Contraseña</h2>

            {/* Input Nueva Contraseña */}
            <Input
                type="password"
                placeholder="Introduce tu Nueva Contraseña"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="input"
            />

            {/* Texto de requisitos */}
            <div className="requisitos">
                <p>
                Te recordamos que eres un <strong>ADMINISTRADOR</strong>, tu
                contraseña es muy importante y debe ser estrictamente difícil de
                descifrar
                </p>
                <ul>
                <li>Mínimo 8-12 caracteres (ideal 12+).</li>
                <li>Debe incluir mayúsculas, minúsculas, números y símbolos.</li>
                <li>No usar datos personales ni palabras comunes.</li>
                <li>No repetir contraseñas anteriores.</li>
                </ul>
            </div>

            {/* Input Confirmar Contraseña */}
            <Input
                type="password"
                placeholder="Vuelve a Introducir la Contraseña"
                value={confirmar}
                onChange={(e: any) => setConfirmar(e.target.value)}
                className="input"
            />

            {/* Botones */}
            <div className="botones">
                <Button onClick={() => router.back("http://localhost:3000/admin/editarperfil")} className="btn volver">
                Volver
                </Button>
                <Button onClick={handleGuardar} className="btn guardar">
                Guardar Cambios
                </Button>
            </div>
            </div>
        </div>
    </div>
    </AdminLayout>
  );
}
