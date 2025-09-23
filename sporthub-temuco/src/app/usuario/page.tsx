'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Página de redirección para usuarios
export default function UsuarioPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente al perfil
    router.replace('/usuario/perfil');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-700">Redirigiendo...</h2>
        <p className="text-gray-500">Para ver el perfil ve a usuario/perfil</p>
      </div>
    </div>
  );
}