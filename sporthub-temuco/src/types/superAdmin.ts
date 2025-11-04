/**
 * Tipos para el módulo SuperAdmin
 */

// === MÉTRICAS GENERALES ===

export interface MetricasGenerales {
  usuarios_totales: number;           // Total de usuarios registrados
  canchas_registradas: number;        // Total de canchas en el sistema
  cantidad_administradores: number;   // Usuarios con rol admin o super_admin
  reservas_hoy: number;              // Reservas realizadas hoy
}

// === MÉTRICAS MENSUALES ===

export interface MetricasMensuales {
  ganancias_mes: number;             // Ingresos totales del mes
  reservas_totales_mes: number;      // Total de reservas del mes
  ocupacion_mensual: number;         // Porcentaje de ocupación (0-100)
  valoracion_promedio: number;       // Valoración promedio de canchas (0-5)
}

// === RESERVAS POR DÍA ===

export interface ReservaPorDia {
  fecha: string;                     // Fecha en formato YYYY-MM-DD
  dia_semana: string;               // Nombre del día (Lunes, Martes, etc.)
  cantidad_reservas: number;        // Total de reservas ese día
  ingresos: number;                 // Ingresos generados ese día
}

// === RESERVAS POR DEPORTE ===

export interface ReservaPorDeporte {
  deporte: string;                  // Tipo de deporte (futbol, tenis, etc.)
  cantidad_reservas: number;        // Total de reservas del mes
  porcentaje: number;              // Porcentaje del total (0-100)
  ingresos: number;                // Ingresos generados
}

// === TOP CANCHAS ===

export interface CanchaPopular {
  cancha_id: number;               // ID de la cancha
  cancha_nombre: string;           // Nombre de la cancha
  complejo_nombre: string;         // Nombre del complejo
  tipo_deporte: string;            // Tipo de deporte
  cantidad_reservas: number;       // Total de reservas
  ocupacion_porcentaje: number;    // Porcentaje de ocupación (0-100)
  tendencia: 'subida' | 'bajada' | 'estable'; // Tendencia vs mes anterior
  variacion_porcentaje: number;    // % de cambio vs mes anterior
}

// === TOP HORARIOS ===

export interface HorarioPopular {
  dia_semana: string;              // Día de la semana
  hora_inicio: string;             // Hora en formato HH:mm
  cantidad_reservas: number;       // Total de reservas en ese horario
  ingresos: number;                // Ingresos generados en ese horario
  tendencia: 'subida' | 'bajada' | 'estable'; // Tendencia vs mes anterior
  variacion_porcentaje: number;    // % de cambio vs mes anterior
}

// === RESPUESTA COMPLETA ===

export interface EstadisticasSuperAdmin {
  // Sección 1: Métricas generales
  metricas_generales: MetricasGenerales;
  
  // Sección 2: Métricas mensuales
  metricas_mensuales: MetricasMensuales;
  
  // Sección 3: Gráfico de reservas por día
  reservas_por_dia: ReservaPorDia[];
  
  // Sección 4: Gráfico de reservas por deporte
  reservas_por_deporte: ReservaPorDeporte[];
  
  // Sección 5: Top 5 canchas más populares
  top_canchas: CanchaPopular[];
  
  // Sección 6: Top 5 horarios más solicitados
  top_horarios: HorarioPopular[];
  
  // Metadata
  fecha_generacion: string;        // Timestamp de generación
  periodo_analisis: string;        // Descripción del período analizado
}
