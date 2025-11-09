import { useState, useEffect } from 'react';
import sessionService, { Sesion, ResumenSesiones } from '@/services/sesionesSuperAdminService';

export function useSesiones() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [resumen, setResumen] = useState<ResumenSesiones | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarSesiones = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [sesionesData, resumenData] = await Promise.all([
        sessionService.obtenerMisSesiones(50, 0),
        sessionService.obtenerResumen()
      ]);

      setSesiones(sesionesData.sesiones);
      setResumen(resumenData);
    } catch (err: any) {
      console.error('Error al cargar sesiones:', err);
      setError(err.message || 'Error al cargar las sesiones');
    } finally {
      setIsLoading(false);
    }
  };

  const cerrarSesion = async (id_sesion: number) => {
    try {
      await sessionService.cerrarSesion(id_sesion);
      await cargarSesiones(); // Recargar después de cerrar
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al cerrar sesión');
      return false;
    }
  };

  const cerrarTodasLasSesiones = async () => {
    try {
      await sessionService.cerrarTodasLasSesiones();
      await cargarSesiones(); // Recargar después de cerrar todas
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al cerrar todas las sesiones');
      return false;
    }
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