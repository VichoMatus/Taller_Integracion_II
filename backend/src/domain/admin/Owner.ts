/**
 * Estadísticas específicas para owners/administradores de complejos deportivos.
 * Representa métricas clave del negocio para la gestión de complejos.
 */
export interface EstadisticasOwner {
  /** Ingresos totales generados en el período */
  ingresos_totales: number;
  /** Porcentaje de ocupación promedio de las canchas */
  ocupacion_promedio: number;
  /** Número de reservas confirmadas en el mes */
  reservas_mes: number;
  /** Cantidad de canchas activas que maneja el owner */
  canchas_activas: number;
}

/**
 * Estadísticas específicas para un complejo deportivo individual.
 * Proporciona métricas detalladas sobre la operación de un complejo específico.
 */
export interface EstadisticasComplejo {
  /** ID del complejo */
  complejo_id: number;
  /** Nombre del complejo */
  complejo_nombre: string;
  /** Cantidad total de canchas del complejo (activas + inactivas) */
  total_canchas: number;
  /** Cantidad de canchas activas disponibles para reserva */
  canchas_activas: number;
  /** Cantidad de canchas inactivas o fuera de servicio */
  canchas_inactivas: number;
  /** Número de reservas en el último mes (30 días) */
  reservas_ultimo_mes: number;
  /** Número de reservas confirmadas en el último mes */
  reservas_confirmadas_ultimo_mes: number;
  /** Número de reservas pendientes en el último mes */
  reservas_pendientes_ultimo_mes: number;
  /** Número de reservas canceladas en el último mes */
  reservas_canceladas_ultimo_mes: number;
  /** Ingresos totales del último mes */
  ingresos_ultimo_mes: number;
  /** Porcentaje de ocupación promedio en el último mes */
  ocupacion_promedio: number;
  /** Fecha de inicio del período de análisis */
  fecha_desde: string;
  /** Fecha de fin del período de análisis */
  fecha_hasta: string;
}

/**
 * Datos de reservas para un día específico de la semana.
 */
export interface ReservasDia {
  /** Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado) */
  dia_numero: number;
  /** Nombre del día en español */
  dia_nombre: string;
  /** Cantidad total de reservas en ese día */
  total_reservas: number;
  /** Cantidad de reservas confirmadas */
  reservas_confirmadas: number;
  /** Cantidad de reservas pendientes */
  reservas_pendientes: number;
  /** Cantidad de reservas canceladas */
  reservas_canceladas: number;
  /** Ingresos generados en ese día */
  ingresos: number;
}

/**
 * Estadísticas de reservas agrupadas por día de la semana.
 * Útil para gráficos de barras mostrando patrones semanales.
 */
export interface ReservasPorDiaSemana {
  /** ID del complejo */
  complejo_id: number;
  /** Nombre del complejo */
  complejo_nombre: string;
  /** Array con datos de cada día (Lunes a Domingo) */
  dias: ReservasDia[];
  /** Período de análisis */
  fecha_desde: string;
  fecha_hasta: string;
  /** Total de reservas en el período */
  total_reservas: number;
  /** Día con más reservas */
  dia_mas_popular: string;
  /** Día con menos reservas */
  dia_menos_popular: string;
}

/**
 * Datos de reservas para una cancha específica.
 */
export interface ReservasCancha {
  /** ID de la cancha */
  cancha_id: number;
  /** Nombre de la cancha */
  cancha_nombre: string;
  /** Tipo de cancha (futbol, basquet, etc.) */
  tipo_cancha: string;
  /** Cantidad total de reservas en el período */
  total_reservas: number;
  /** Cantidad de reservas confirmadas */
  reservas_confirmadas: number;
  /** Cantidad de reservas pendientes */
  reservas_pendientes: number;
  /** Cantidad de reservas canceladas */
  reservas_canceladas: number;
  /** Ingresos generados por esta cancha */
  ingresos: number;
  /** Porcentaje de ocupación de esta cancha */
  ocupacion_porcentaje: number;
}

/**
 * Estadísticas de reservas agrupadas por cancha.
 * Útil para gráficos de barras comparando el rendimiento de cada cancha.
 */
export interface ReservasPorCancha {
  /** ID del complejo */
  complejo_id: number;
  /** Nombre del complejo */
  complejo_nombre: string;
  /** Array con datos de cada cancha */
  canchas: ReservasCancha[];
  /** Período de análisis */
  fecha_desde: string;
  fecha_hasta: string;
  /** Total de reservas en el período */
  total_reservas: number;
  /** Cancha con más reservas */
  cancha_mas_popular: string;
  /** Cancha con menos reservas */
  cancha_menos_popular: string;
  /** Ingreso total del complejo */
  ingresos_totales: number;
}

/**
 * Vista específica de reserva para owners/administradores.
 * Contiene información relevante para la gestión del negocio.
 */
export interface ReservaOwner {
  /** Identificador único de la reserva */
  id: number;
  /** ID del usuario que hizo la reserva */
  usuario_id: number;
  /** ID de la cancha reservada */
  cancha_id: number;
  /** Fecha de la reserva en formato YYYY-MM-DD */
  fecha: string;
  /** Hora de inicio de la reserva */
  hora_inicio: string;
  /** Hora de fin de la reserva */
  hora_fin: string;
  /** Estado actual de la reserva */
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  /** Precio total pagado por la reserva */
  precio_total: number;
  /** Información adicional del usuario (opcional) */
  usuario_nombre?: string;
  usuario_email?: string;
  /** Información adicional de la cancha (opcional) */
  cancha_nombre?: string;
  complejo_nombre?: string;
}

import { Complejo } from "../complejo/Complejo";
import { Cancha } from "../cancha/Cancha";

/**
 * Resumen de recursos para el panel del owner.
 * Aggregación de todas las entidades que maneja un owner.
 */
export interface ResumenOwner {
  /** Lista de complejos del owner */
  complejos: Complejo[];
  /** Lista de canchas del owner */
  canchas: Cancha[];
  /** Lista de reservas activas */
  reservas: ReservaOwner[];
  /** Estadísticas del negocio */
  estadisticas: EstadisticasOwner;
}