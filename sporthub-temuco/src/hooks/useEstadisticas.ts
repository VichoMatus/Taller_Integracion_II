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
      // El backend puede devolver la estructura en data o en response.data
      const payload = data?.data ?? data;
      setEstadisticas(payload);
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
      const payload = data?.data ?? data ?? {};
      // Normalize shape
      const diasArray = Array.isArray(payload?.dias) ? payload.dias.filter(Boolean) : [];
      setReservasPorDia({ ...payload, dias: diasArray });
    } catch (error: any) {
      setErrorReservasDia(error.message);
      console.error('Error al cargar reservas por día:', error);
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
      const payload = data?.data ?? data ?? {};
      const canchasArray = Array.isArray(payload?.canchas) ? payload.canchas.filter(Boolean) : [];
      setReservasPorCancha({ ...payload, canchas: canchasArray });
    } catch (error: any) {
      setErrorReservasCancha(error.message);
      console.error('Error al cargar reservas por cancha:', error);
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
