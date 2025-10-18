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