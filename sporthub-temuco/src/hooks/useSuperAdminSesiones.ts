import { useState, useEffect } from 'react';

// Tipos simulados
export interface Sesion {
  id_sesion: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  duracion_minutos: number | null;
  estado: 'activa' | 'finalizada';
}

export interface ResumenSesiones {
  total_sesiones: number;
  sesiones_activas: number;
  tiempo_promedio_minutos: number;
  ultima_conexion: string;
}

export function useSesiones() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [resumen, setResumen] = useState<ResumenSesiones | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulación de datos
  const cargarSesiones = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(res => setTimeout(res, 600));
      const now = new Date();
      setSesiones([
        {
          id_sesion: 1,
          fecha_inicio: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
          fecha_fin: null,
          duracion_minutos: null,
          estado: 'activa'
        },
        {
          id_sesion: 2,
          fecha_inicio: new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString(),
          fecha_fin: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
          duracion_minutos: 120,
          estado: 'finalizada'
        }
      ]);
      setResumen({
        total_sesiones: 2,
        sesiones_activas: 1,
        tiempo_promedio_minutos: 120,
        ultima_conexion: now.toISOString()
      });
    } catch (err: any) {
      setError('Error al cargar las sesiones');
    } finally {
      setIsLoading(false);
    }
  };

  const cerrarSesion = async (id_sesion: number) => {
    setSesiones(prev =>
      prev.map(s =>
        s.id_sesion === id_sesion
          ? { ...s, estado: 'finalizada', fecha_fin: new Date().toISOString(), duracion_minutos: 123 }
          : s
      )
    );
    return true;
  };

  const cerrarTodasLasSesiones = async () => {
    setSesiones(prev =>
      prev.map((s, idx) =>
        idx === 0
          ? s
          : { ...s, estado: 'finalizada', fecha_fin: new Date().toISOString(), duracion_minutos: 99 }
      )
    );
    return true;
  };

  useEffect(() => {
    cargarSesiones();
  }, []);

  return {
    sesiones,
    resumen,
    isLoading,
    error,
    refetch: cargarSesiones,
    cerrarSesion,
    cerrarTodasLasSesiones
  };
}