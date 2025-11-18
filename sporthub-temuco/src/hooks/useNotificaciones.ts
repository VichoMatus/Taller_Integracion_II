import { useState, useEffect, useCallback } from 'react';
import { notificacionesService } from '@/services/notificacionesService';
import { Notificacion } from '@/types/notificaciones';

export const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarNotificaciones = useCallback(async () => {
    // Verificar si hay token
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      console.log('⏸️ [useNotificaciones] No hay token, saltando carga');
      return;
    }

    try {
      console.log('🔍 [useNotificaciones] Cargando notificaciones...');
      setLoading(true);
      setError(null);
      
      const todas = await notificacionesService.list();
      
      console.log('✅ [useNotificaciones] Notificaciones cargadas:', todas.length);
      setNotificaciones(todas);
      setNoLeidas(todas.filter(n => !n.leida).length);
      
    } catch (err: any) {
      console.error('❌ [useNotificaciones] Error:', err);
      setError(err.message || 'Error al cargar notificaciones');
      setNotificaciones([]);
      setNoLeidas(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarComoLeida = useCallback(async (id: number) => {
    try {
      const resultado = await notificacionesService.marcarLeida(id);
      
      if (resultado) {
        setNotificaciones(prev => 
          prev.map(n => n.id_notificacion === id ? { ...n, leida: true } : n)
        );
        setNoLeidas(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message || 'Error al marcar como leída');
    }
  }, []);

  const marcarTodasLeidas = useCallback(async () => {
    try {
      const exito = await notificacionesService.marcarTodasLeidas();
      
      if (exito) {
        setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
        setNoLeidas(0);
      }
    } catch (err: any) {
      setError(err.message || 'Error al marcar todas como leídas');
    }
  }, []);

  const eliminarNotificacion = useCallback(async (id: number) => {
    try {
      const exito = await notificacionesService.remove(id);
      
      if (exito) {
        const notif = notificaciones.find(n => n.id_notificacion === id);
        setNotificaciones(prev => prev.filter(n => n.id_notificacion !== id));
        
        if (notif && !notif.leida) {
          setNoLeidas(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar notificación');
    }
  }, [notificaciones]);

  useEffect(() => {
    cargarNotificaciones();
    
    // Polling cada 30 segundos
    const interval = setInterval(cargarNotificaciones, 30000);
    
    return () => clearInterval(interval);
  }, [cargarNotificaciones]);

  return {
    notificaciones,
    noLeidas,
    loading,
    error,
    cargarNotificaciones,
    marcarComoLeida,
    marcarTodasLeidas,
    eliminarNotificacion
  };
};