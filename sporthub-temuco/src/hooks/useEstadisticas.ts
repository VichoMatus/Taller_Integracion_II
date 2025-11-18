import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import {
  EstadisticasComplejo,
  ReservasPorDiaSemana,
  ReservasPorCancha
} from '../types/admin';

/**
 * Hook personalizado para manejar estadísticas de complejos deportivos
 */
export const useEstadisticas = (complejoId: number | null) => {
  // Estados para estadísticas generales
  const [estadisticas, setEstadisticas] = useState<EstadisticasComplejo | null>(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [errorEstadisticas, setErrorEstadisticas] = useState<string | null>(null);

  // Estados para reservas por día
  const [reservasPorDia, setReservasPorDia] = useState<ReservasPorDiaSemana | null>(null);
  const [loadingReservasDia, setLoadingReservasDia] = useState(false);
  const [errorReservasDia, setErrorReservasDia] = useState<string | null>(null);

  // Estados para reservas por cancha
  const [reservasPorCancha, setReservasPorCancha] = useState<ReservasPorCancha | null>(null);
  const [loadingReservasCancha, setLoadingReservasCancha] = useState(false);
  const [errorReservasCancha, setErrorReservasCancha] = useState<string | null>(null);

  // Período de análisis (días hacia atrás)
  const [diasAnalisis, setDiasAnalisis] = useState(30);

  /**
   * Cargar estadísticas generales del complejo
   */
  const cargarEstadisticas = useCallback(async () => {
    if (!complejoId) return;

    setLoadingEstadisticas(true);
    setErrorEstadisticas(null);

    try {
      const data = await adminService.getEstadisticasComplejo(complejoId);
      // El interceptor ya desenvuelve { ok: true, data: {...} }
      // adminService.getEstadisticasComplejo retorna response.data que ya es el payload
      setEstadisticas(data);
    } catch (error: any) {
      setErrorEstadisticas(error.message);
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoadingEstadisticas(false);
    }
  }, [complejoId]);

  /**
   * Cargar reservas por día de la semana
   */
  const cargarReservasPorDia = useCallback(async (dias: number = diasAnalisis) => {
    if (!complejoId) return;

    setLoadingReservasDia(true);
    setErrorReservasDia(null);

    try {
      const data = await adminService.getReservasPorDiaSemana(complejoId, dias);
      // adminService ya retorna el payload procesado y validado
      // data ya tiene la estructura { dias: [...], complejo_id, ... }
      setReservasPorDia(data);
    } catch (error: any) {
      setErrorReservasDia(error.message);
      console.error('Error al cargar reservas por día:', error);
      // Establecer estado vacío en caso de error
      setReservasPorDia({
        dias: [],
        complejo_id: complejoId,
        complejo_nombre: 'Complejo',
        total_reservas: 0,
        fecha_desde: '',
        fecha_hasta: '',
        dia_mas_popular: '',
        dia_menos_popular: ''
      });
    } finally {
      setLoadingReservasDia(false);
    }
  }, [complejoId, diasAnalisis]);

  /**
   * Cargar reservas por cancha
   */
  const cargarReservasPorCancha = useCallback(async (dias: number = diasAnalisis) => {
    if (!complejoId) return;

    setLoadingReservasCancha(true);
    setErrorReservasCancha(null);

    try {
      const data = await adminService.getReservasPorCancha(complejoId, dias);
      // adminService ya retorna el payload procesado y validado
      // data ya tiene la estructura { canchas: [...], complejo_id, ... }
      setReservasPorCancha(data);
    } catch (error: any) {
      setErrorReservasCancha(error.message);
      console.error('Error al cargar reservas por cancha:', error);
      // Establecer estado vacío en caso de error
      setReservasPorCancha({
        canchas: [],
        complejo_id: complejoId,
        complejo_nombre: 'Complejo',
        total_reservas: 0,
        fecha_desde: '',
        fecha_hasta: '',
        cancha_mas_popular: '',
        cancha_menos_popular: '',
        ingresos_totales: 0
      });
    } finally {
      setLoadingReservasCancha(false);
    }
  }, [complejoId, diasAnalisis]);

  /**
   * Cargar todas las estadísticas
   */
  const cargarTodo = useCallback(async () => {
    await Promise.all([
      cargarEstadisticas(),
      cargarReservasPorDia(),
      cargarReservasPorCancha()
    ]);
  }, [cargarEstadisticas, cargarReservasPorDia, cargarReservasPorCancha]);

  /**
   * Refrescar estadísticas con nuevo período
   */
  const cambiarPeriodo = useCallback(async (nuevosDias: number) => {
    setDiasAnalisis(nuevosDias);
    await Promise.all([
      cargarReservasPorDia(nuevosDias),
      cargarReservasPorCancha(nuevosDias)
    ]);
  }, [cargarReservasPorDia, cargarReservasPorCancha]);

  /**
   * Cargar datos iniciales cuando cambia el complejo
   */
  useEffect(() => {
    if (complejoId) {
      cargarTodo();
    }
  }, [complejoId, cargarTodo]);

  return {
    // Estadísticas generales
    estadisticas,
    loadingEstadisticas,
    errorEstadisticas,
    cargarEstadisticas,

    // Reservas por día
    reservasPorDia,
    loadingReservasDia,
    errorReservasDia,
    cargarReservasPorDia,

    // Reservas por cancha
    reservasPorCancha,
    loadingReservasCancha,
    errorReservasCancha,
    cargarReservasPorCancha,

    // Funciones generales
    cargarTodo,
    cambiarPeriodo,
    diasAnalisis,

    // Estado general
    isLoading: loadingEstadisticas || loadingReservasDia || loadingReservasCancha,
    hasError: !!errorEstadisticas || !!errorReservasDia || !!errorReservasCancha
  };
};
