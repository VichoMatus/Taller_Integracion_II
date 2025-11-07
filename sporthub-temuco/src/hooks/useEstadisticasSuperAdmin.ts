import { useState, useEffect, useCallback } from 'react';
import { superAdminService } from '../services/superAdminService';
import type { EstadisticasSuperAdmin } from '../types/superAdmin';

/**
 * Hook personalizado para manejar estadísticas de SuperAdmin
 * 
 * Características:
 * - Carga automática al montar el componente
 * - Estados de loading y error
 * - Métodos para recargar datos
 * - Métodos para obtener secciones específicas
 * 
 * @returns Objeto con estadísticas, estados y métodos de control
 */
export function useEstadisticasSuperAdmin() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasSuperAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar todas las estadísticas
   */
  const cargarEstadisticas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 Cargando estadísticas completas...');
      const data = await superAdminService.obtenerEstadisticasCompletas();
      
      setEstadisticas(data);
      console.log('✅ Estadísticas cargadas exitosamente');
    } catch (err: any) {
      console.error('❌ Error al cargar estadísticas:', err);
      setError(err.message || 'Error al cargar estadísticas');
      setEstadisticas(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cargar solo métricas generales
   */
  const cargarMetricasGenerales = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const metricas = await superAdminService.obtenerMetricasGenerales();
      
      // Actualizar solo la sección de métricas generales
      setEstadisticas(prev => prev ? { ...prev, metricas_generales: metricas } : null);
    } catch (err: any) {
      console.error('❌ Error al cargar métricas generales:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cargar solo métricas mensuales
   */
  const cargarMetricasMensuales = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const metricas = await superAdminService.obtenerMetricasMensuales();
      
      // Actualizar solo la sección de métricas mensuales
      setEstadisticas(prev => prev ? { ...prev, metricas_mensuales: metricas } : null);
    } catch (err: any) {
      console.error('❌ Error al cargar métricas mensuales:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cargar solo datos de gráficos
   */
  const cargarDataGraficos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await superAdminService.obtenerDataGraficos();
      
      // Actualizar secciones de gráficos
      setEstadisticas(prev => prev ? {
        ...prev,
        reservas_por_dia: data.reservas_por_dia,
        reservas_por_deporte: data.reservas_por_deporte
      } : null);
    } catch (err: any) {
      console.error('❌ Error al cargar datos de gráficos:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cargar solo tops (canchas y horarios)
   */
  const cargarTops = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tops = await superAdminService.obtenerTops();
      
      // Actualizar secciones de tops
      setEstadisticas(prev => prev ? {
        ...prev,
        top_canchas: tops.top_canchas,
        top_horarios: tops.top_horarios
      } : null);
    } catch (err: any) {
      console.error('❌ Error al cargar tops:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Recargar todas las estadísticas
   */
  const refetch = useCallback(() => {
    return cargarEstadisticas();
  }, [cargarEstadisticas]);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  return {
    // Datos
    estadisticas,
    
    // Estados
    isLoading,
    error,
    hasError: error !== null,
    
    // Métodos de carga completa
    cargarEstadisticas,
    refetch,
    
    // Métodos de carga parcial
    cargarMetricasGenerales,
    cargarMetricasMensuales,
    cargarDataGraficos,
    cargarTops,
    
    // Accesos directos a secciones (con validación)
    metricas_generales: estadisticas?.metricas_generales || null,
    metricas_mensuales: estadisticas?.metricas_mensuales || null,
    reservas_por_dia: estadisticas?.reservas_por_dia || [],
    reservas_por_deporte: estadisticas?.reservas_por_deporte || [],
    top_canchas: estadisticas?.top_canchas || [],
    top_horarios: estadisticas?.top_horarios || [],
    fecha_generacion: estadisticas?.fecha_generacion || null,
    periodo_analisis: estadisticas?.periodo_analisis || null
  };
}
