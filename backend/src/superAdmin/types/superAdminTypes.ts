/**
 * TIPOS Y INTERFACES DEL MÓDULO SUPERADMIN
 * =====================================
 * 
 * Este archivo define todas las interfaces TypeScript utilizadas en el módulo SuperAdmin.
 * Estas interfaces aseguran la consistencia de tipos entre el frontend y backend,
 * y definen la estructura de datos que se intercambia con la API FastAPI hosteada.
 * 
 * Uso: Importar estas interfaces en controladores, servicios y componentes frontend
 * Ejemplo: import { LoginRequest, ApiResponse } from './types/superAdminTypes';
 */

/**
 * INTERFACES DE AUTENTICACIÓN
 * ===========================
 */

/**
 * Estructura de datos para el login de usuario
 * Utilizada cuando el frontend envía credenciales de acceso
 */
export interface LoginRequest {
  email: string;    // Email del usuario (requerido)
  password: string; // Contraseña del usuario (requerido)
}

/**
 * Respuesta del servidor al realizar login exitoso
 * Contiene tokens JWT y datos del usuario autenticado
 */
export interface TokenResponse {
  access_token: string;  // JWT token para autenticación de requests
  refresh_token: string; // Token para renovar el access_token
  token_type: string;    // Tipo de token (generalmente "Bearer")
  user: UserPublic;      // Datos públicos del usuario logueado
}

/**
 * INTERFACES DE USUARIO
 * =====================
 */

/**
 * Datos públicos de un usuario (sin información sensible)
 * Utilizada para mostrar información de usuarios en el frontend
 */
export interface UserPublic {
  id_usuario: number;                                           // ID único del usuario
  nombre: string;                                               // Nombre del usuario
  apellido: string;                                             // Apellido del usuario
  email: string;                                                // Email del usuario
  telefono?: string;                                            // Teléfono (opcional)
  avatar?: string;                                              // URL del avatar (opcional)
  rol: 'usuario' | 'admin' | 'super_admin';          // Rol del usuario en el sistema
  activo: boolean;                                              // Estado activo/inactivo
  verificado: boolean;                                          // Si el email está verificado
  fecha_creacion: string;                                       // Fecha de creación (ISO format)
}

/**
 * INTERFACES DE CONSULTAS Y PAGINACIÓN
 * ====================================
 */

/**
 * Parámetros base para consultas paginadas
 * Utilizada en endpoints que retornan listas con paginación
 */
export interface BaseQuery {
  page?: number;      // Número de página (default: 1)
  page_size?: number; // Cantidad de elementos por página (default: 20)
}

/**
 * INTERFACES DE RESPUESTAS API
 * ============================
 */

/**
 * Estructura estándar de respuesta de la API
 * Utilizada para mantener consistencia en todas las respuestas del servidor
 * 
 * @template T - Tipo de datos que contiene la respuesta
 */
export interface ApiResponse<T = any> {
  ok: boolean;      // Indica si la operación fue exitosa
  data?: T;         // Datos de respuesta (cuando ok: true)
  message?: string; // Mensaje informativo (opcional)
  error?: string;   // Mensaje de error (cuando ok: false)
}

/**
 * INTERFACES DE ESTADÍSTICAS SUPERADMIN
 * =====================================
 */

/**
 * Métricas generales del sistema
 */
export interface MetricasGenerales {
  usuarios_totales: number;           // Total de usuarios registrados
  canchas_registradas: number;        // Total de canchas en el sistema
  cantidad_administradores: number;   // Total de usuarios con rol admin
  reservas_hoy: number;              // Reservas realizadas hoy
}

/**
 * Métricas financieras y de ocupación del mes
 */
export interface MetricasMensuales {
  ganancias_mes: number;             // Ingresos totales del mes
  reservas_totales_mes: number;      // Total de reservas del mes
  ocupacion_mensual: number;         // Porcentaje de ocupación (0-100)
  valoracion_promedio: number;       // Valoración promedio de canchas (0-5)
}

/**
 * Datos para gráfico de reservas por día
 */
export interface ReservaPorDia {
  fecha: string;                     // Fecha en formato YYYY-MM-DD
  dia_semana: string;               // Nombre del día (Lunes, Martes, etc.)
  cantidad_reservas: number;        // Total de reservas ese día
  ingresos: number;                 // Ingresos generados ese día
}

/**
 * Datos para gráfico de reservas por deporte
 */
export interface ReservaPorDeporte {
  deporte: string;                  // Tipo de deporte (futbol, tenis, etc.)
  cantidad_reservas: number;        // Total de reservas del mes
  porcentaje: number;              // Porcentaje del total (0-100)
  ingresos: number;                // Ingresos generados
}

/**
 * Top cancha más popular
 */
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

/**
 * Horario más solicitado
 */
export interface HorarioPopular {
  dia_semana: string;              // Día de la semana
  hora_inicio: string;             // Hora en formato HH:mm
  cantidad_reservas: number;       // Total de reservas en ese horario
  ingresos: number;                // Ingresos generados en ese horario
  tendencia: 'subida' | 'bajada' | 'estable'; // Tendencia vs mes anterior
  variacion_porcentaje: number;    // % de cambio vs mes anterior
}

/**
 * Respuesta completa de estadísticas para SuperAdmin
 */
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