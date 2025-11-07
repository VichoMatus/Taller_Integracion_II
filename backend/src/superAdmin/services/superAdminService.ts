/**
 * SERVICIO SUPERADMIN - CLIENTE HTTP PARA API FASTAPI
 * ===================================================
 * 
 * Este servicio actúa como un cliente HTTP que consume la API FastAPI hosteada en   async getUsers(params: any = {}): Promise<ApiResponse> {
    try {
      console.log('🔄 [SuperAdminService] Consultando usuarios a FastAPI con params:', params);
      
      // 🎯 Asegurar que el filtro por rol se aplique correctamente
      const filteredParams = {
        ...params,
        rol: params.rol || 'usuario'  // Por defecto, solo usuarios regulares
      };
      
      console.log('🎯 [SuperAdminService] Parámetros con filtro aplicado:', filteredParams);
      
      const response = await this.apiClient.get(API_ENDPOINTS.usuarios.base, { params: filteredParams });
      console.log('✅ [SuperAdminService] Respuesta de FastAPI recibida:', response.status);
      console.log('📊 [SuperAdminService] Datos de FastAPI:', JSON.stringify(response.data, null, 2));
      
      return { ok: true, data: response.data };
    } catch (error: any) {
      console.error('❌ [SuperAdminService] Error consultando FastAPI:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return { ok: false, error: error.response?.data?.message || 'Error al obtener usuarios' };
    }
  }d.
 * Implementa el patrón Backend-for-Frontend (BFF), actuando como proxy entre el frontend
 * React/Next.js y la API externa.
 * 
 * Funcionalidades principales:
 * - Autenticación con JWT tokens
 * - Gestión de usuarios del sistema
 * - Administración de complejos deportivos
 * - Funciones específicas de SuperAdmin
 * - Dashboard y búsquedas globales
 * 
 * Uso desde el frontend:
 * - El frontend hace llamadas a este backend (Node.js)
 * - Este servicio traduce las llamadas a la API FastAPI
 * - Retorna datos estandarizados en formato ApiResponse<T>
 */

import axios, { AxiosInstance } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../../config/config';
import { LoginRequest, TokenResponse, ApiResponse } from '../types/superAdminTypes';

/**
 * CLASE PRINCIPAL DEL SERVICIO SUPERADMIN
 * =======================================
 */
export class SuperAdminService {
  private apiClient: AxiosInstance; // Cliente HTTP configurado para la API FastAPI
  private authToken: string | null = null; // Token JWT almacenado en memoria

  /**
   * CONSTRUCTOR - Configuración inicial
   * ===================================
   * Inicializa el cliente HTTP con configuración base y interceptors
   */
  constructor() {
    // Crear instancia de axios con configuración base
    this.apiClient = axios.create({
      baseURL: API_CONFIG.baseURL,   // URL base de la API FastAPI
      timeout: API_CONFIG.timeout,   // Timeout para requests
      headers: API_CONFIG.headers,   // Headers por defecto
    });

    // Interceptor para agregar autenticación automáticamente
    this.apiClient.interceptors.request.use((config) => {
      // Agregar token Bearer si está disponible
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      // Agregar API Key si está configurada
      if (API_CONFIG.apiKey) {
        config.headers['X-API-Key'] = API_CONFIG.apiKey;
      }
      return config;
    });
  }

  /**
   * MÉTODOS DE AUTENTICACIÓN
   * ========================
   */

  /**
   * Autenticar usuario en el sistema
   * @param credentials - Email y contraseña del usuario
   * @returns Promise<ApiResponse<TokenResponse>> - Tokens y datos del usuario
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<TokenResponse>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.login, credentials);
      
      // Verificar que el usuario tiene permisos de administrador
      if (response.data.user.rol !== 'super_admin' && response.data.user.rol !== 'admin') {
        return { ok: false, error: 'Usuario no autorizado para el panel de administración' };
      }

      // Almacenar token para futuras peticiones
      this.authToken = response.data.access_token;
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error de autenticación' };
    }
  }

  /**
   * Cerrar sesión del usuario
   * @param refreshToken - Token de refresco para invalidar
   * @returns Promise<ApiResponse> - Confirmación de logout
   */
  async logout(refreshToken: string): Promise<ApiResponse> {
    try {
      await this.apiClient.post(API_ENDPOINTS.auth.logout, { refresh_token: refreshToken });
      this.authToken = null; // Limpiar token almacenado
      return { ok: true, message: 'Sesión cerrada exitosamente' };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al cerrar sesión' };
    }
  }

  /**
   * MÉTODOS DE GESTIÓN DE USUARIOS
   * ==============================
   */

  /**
   * Obtener lista de usuarios con paginación y filtros
   * @param params - Parámetros de consulta (page, page_size, filtros)
   * @param token - Token JWT del usuario autenticado
   * @returns Promise<ApiResponse> - Lista paginada de usuarios
   */
  async getUsers(params: any = {}, token?: string): Promise<ApiResponse> {
    try {
      // Preparar headers con token si está disponible
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('🔍 [SuperAdminService] Haciendo petición a FastAPI:', {
        url: `${API_CONFIG.baseURL}${API_ENDPOINTS.usuarios.base}`,
        params,
        hasToken: !!token
      });

      const response = await this.apiClient.get(API_ENDPOINTS.usuarios.base, { 
        params,
        headers
      });
      
      console.log('✅ [SuperAdminService] Respuesta de FastAPI recibida:', response.status);
      return { ok: true, data: response.data };
    } catch (error: any) {
      console.error('❌ [SuperAdminService] Error al obtener usuarios:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return { ok: false, error: error.response?.data?.message || error.message || 'Error al obtener usuarios' };
    }
  }

  /**
   * Obtener usuario específico por ID
   */
  async getUserById(id: number, token?: string): Promise<ApiResponse> {
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await this.apiClient.get(API_ENDPOINTS.usuarios.byId(id), { headers });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener usuario' };
    }
  }

  /**
   * Actualizar datos de usuario
   */
  async updateUser(id: number, data: any, token?: string): Promise<ApiResponse> {
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await this.apiClient.patch(API_ENDPOINTS.usuarios.byId(id), data, { headers });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al actualizar usuario' };
    }
  }

  /**
   * Desactivar/eliminar usuario (soft delete)
   */
  async deleteUser(id: number, token?: string): Promise<ApiResponse> {
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      await this.apiClient.delete(API_ENDPOINTS.usuarios.byId(id), { headers });
      return { ok: true, message: 'Usuario desactivado correctamente' };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al desactivar usuario' };
    }
  }

  /**
   * MÉTODOS DE GESTIÓN DE COMPLEJOS DEPORTIVOS
   * ==========================================
   */

  /** Obtener lista de complejos con filtros y paginación */
  async getComplejos(params: any = {}): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.complejos.base, { params });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener complejos' };
    }
  }

  async getComplejoById(id: number, params: any = {}): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.complejos.byId(id), { params });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener complejo' };
    }
  }

  async getComplejoCanchas(id: number): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.complejos.canchas(id));
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener canchas' };
    }
  }

  // SuperAdmin específico
  async updateSystemParameters(parametros: any): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.super_admin.parametros, parametros);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al actualizar parámetros' };
    }
  }

  async getSystemStatistics(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.super_admin.estadisticas);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener estadísticas' };
    }
  }

  async getSystemLogs(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.super_admin.logs);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener logs' };
    }
  }

  // Dashboard simplificado
  async getDashboardData(): Promise<ApiResponse> {
    try {
      // Obtener datos básicos para el dashboard
      const [users, complejos] = await Promise.all([
        this.getUsers({ page: 1, page_size: 5 }),
        this.getComplejos({ page: 1, page_size: 5 })
      ]);

      return {
        ok: true,
        data: {
          recentUsers: users.data?.users || users.data || [],
          recentComplejos: complejos.data?.complejos || complejos.data || []
        }
      };
    } catch (error) {
      return { ok: false, error: 'Error al obtener datos del dashboard' };
    }
  }

  // Búsqueda global simplificada
  async globalSearch(query: string): Promise<ApiResponse> {
    try {
      const [users, complejos] = await Promise.all([
        this.getUsers({ q: query, page_size: 5 }),
        this.getComplejos({ q: query, page_size: 5 })
      ]);

      return {
        ok: true,
        data: {
          users: users.data?.users || users.data || [],
          complejos: complejos.data?.complejos || complejos.data || []
        }
      };
    } catch (error) {
      return { ok: false, error: 'Error en la búsqueda' };
    }
  }

  /**
   * ESTADÍSTICAS COMPLETAS DE SUPERADMIN
   * ====================================
   */
  async getEstadisticasCompletas(token?: string): Promise<ApiResponse> {
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log('📊 [SuperAdminService] Iniciando recopilación de estadísticas...');

      // Obtener fecha actual y hace 30 días para filtros
      const hoy = new Date();
      const hoyStr = hoy.toISOString().split('T')[0];
      const hace30Dias = new Date(hoy);
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      const hace30DiasStr = hace30Dias.toISOString().split('T')[0];
      
      const hace60Dias = new Date(hoy);
      hace60Dias.setDate(hace60Dias.getDate() - 60);
      const hace60DiasStr = hace60Dias.toISOString().split('T')[0];

      // 1. MÉTRICAS GENERALES
      console.log('📊 Obteniendo métricas generales...');
      
      // Obtener todos los usuarios (sin límite)
      const usuariosResponse = await this.apiClient.get(API_ENDPOINTS.usuarios.base, { 
        headers,
        params: { page_size: 10000 } // Suficientemente grande para obtener todos
      });
      
      const todosUsuarios = usuariosResponse.data?.usuarios || usuariosResponse.data || [];
      const usuarios_totales = todosUsuarios.length;
      const cantidad_administradores = todosUsuarios.filter(
        (u: any) => u.rol === 'admin' || u.rol === 'super_admin'
      ).length;

      // Obtener todas las canchas
      const canchasResponse = await this.apiClient.get(API_ENDPOINTS.canchas.base, { 
        headers,
        params: { page_size: 10000 }
      });
      const todasCanchas = canchasResponse.data?.canchas || canchasResponse.data || [];
      const canchas_registradas = todasCanchas.length;

      // Obtener reservas de hoy
      const reservasHoyResponse = await this.apiClient.get(API_ENDPOINTS.reservas.base, {
        headers,
        params: { 
          fecha_desde: hoyStr,
          fecha_hasta: hoyStr,
          page_size: 10000
        }
      });
      const reservasHoy = reservasHoyResponse.data?.reservas || reservasHoyResponse.data || [];
      const reservas_hoy = reservasHoy.length;

      // 2. MÉTRICAS MENSUALES
      console.log('📊 Obteniendo métricas mensuales...');
      
      const reservasMesResponse = await this.apiClient.get(API_ENDPOINTS.reservas.base, {
        headers,
        params: {
          fecha_desde: hace30DiasStr,
          fecha_hasta: hoyStr,
          page_size: 10000
        }
      });
      const reservasMes = reservasMesResponse.data?.reservas || reservasMesResponse.data || [];
      const reservas_totales_mes = reservasMes.length;

      // Calcular ganancias del mes (solo reservas confirmadas o pagadas)
      const ganancias_mes = reservasMes
        .filter((r: any) => r.estado_pago === 'pagado' || r.estado === 'confirmada')
        .reduce((sum: number, r: any) => sum + (parseFloat(r.precio_total) || 0), 0);

      // Calcular ocupación mensual
      // Ocupación = (Reservas confirmadas / Slots totales disponibles) * 100
      const diasEnMes = 30;
      const horasPorDia = 14; // Ej: de 8am a 10pm
      const slotsDisponibles = canchas_registradas * diasEnMes * horasPorDia;
      const reservasConfirmadas = reservasMes.filter((r: any) => 
        r.estado === 'confirmada' || r.estado === 'completada'
      ).length;
      const ocupacion_mensual = slotsDisponibles > 0 
        ? (reservasConfirmadas / slotsDisponibles) * 100 
        : 0;

      // Obtener valoración promedio de canchas
      const resenasResponse = await this.apiClient.get(API_ENDPOINTS.resenas.base, {
        headers,
        params: { page_size: 10000 }
      });
      const resenas = resenasResponse.data?.resenas || resenasResponse.data || [];
      const valoracion_promedio = resenas.length > 0
        ? resenas.reduce((sum: number, r: any) => sum + (r.calificacion || 0), 0) / resenas.length
        : 0;

      // 3. RESERVAS POR DÍA (últimos 30 días)
      console.log('📊 Calculando reservas por día...');
      
      const reservasPorDiaMap = new Map<string, { cantidad: number; ingresos: number }>();
      
      // Inicializar todos los días del mes con 0
      for (let i = 0; i < 30; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - (29 - i));
        const fechaStr = fecha.toISOString().split('T')[0];
        reservasPorDiaMap.set(fechaStr, { cantidad: 0, ingresos: 0 });
      }

      // Agregar reservas reales
      reservasMes.forEach((reserva: any) => {
        const fechaReserva = reserva.fecha_reserva?.split('T')[0] || reserva.fecha?.split('T')[0];
        if (fechaReserva && reservasPorDiaMap.has(fechaReserva)) {
          const data = reservasPorDiaMap.get(fechaReserva)!;
          data.cantidad++;
          if (reserva.estado_pago === 'pagado' || reserva.estado === 'confirmada') {
            data.ingresos += parseFloat(reserva.precio_total) || 0;
          }
        }
      });

      const reservas_por_dia = Array.from(reservasPorDiaMap.entries()).map(([fecha, data]) => {
        const fechaObj = new Date(fecha + 'T12:00:00');
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return {
          fecha,
          dia_semana: diasSemana[fechaObj.getDay()],
          cantidad_reservas: data.cantidad,
          ingresos: data.ingresos
        };
      });

      // 4. RESERVAS POR DEPORTE
      console.log('📊 Calculando reservas por deporte...');
      
      const reservasPorDeporteMap = new Map<string, { cantidad: number; ingresos: number }>();
      
      reservasMes.forEach((reserva: any) => {
        const canchaId = reserva.cancha_id || reserva.id_cancha;
        const cancha = todasCanchas.find((c: any) => c.id_cancha === canchaId || c.id === canchaId);
        
        if (cancha) {
          const deporte = cancha.tipo_cancha || cancha.deporte || 'otros';
          if (!reservasPorDeporteMap.has(deporte)) {
            reservasPorDeporteMap.set(deporte, { cantidad: 0, ingresos: 0 });
          }
          const data = reservasPorDeporteMap.get(deporte)!;
          data.cantidad++;
          if (reserva.estado_pago === 'pagado' || reserva.estado === 'confirmada') {
            data.ingresos += parseFloat(reserva.precio_total) || 0;
          }
        }
      });

      const totalReservasDeporte = Array.from(reservasPorDeporteMap.values())
        .reduce((sum, d) => sum + d.cantidad, 0);

      const reservas_por_deporte = Array.from(reservasPorDeporteMap.entries()).map(([deporte, data]) => ({
        deporte,
        cantidad_reservas: data.cantidad,
        porcentaje: totalReservasDeporte > 0 ? (data.cantidad / totalReservasDeporte) * 100 : 0,
        ingresos: data.ingresos
      })).sort((a, b) => b.cantidad_reservas - a.cantidad_reservas);

      // 5. TOP 5 CANCHAS MÁS POPULARES
      console.log('📊 Calculando top canchas...');
      
      // Obtener reservas del mes anterior para calcular tendencias
      const reservasMesAnteriorResponse = await this.apiClient.get(API_ENDPOINTS.reservas.base, {
        headers,
        params: {
          fecha_desde: hace60DiasStr,
          fecha_hasta: hace30DiasStr,
          page_size: 10000
        }
      });
      const reservasMesAnterior = reservasMesAnteriorResponse.data?.reservas || [];

      const canchaStats = new Map<number, { 
        cantidad: number; 
        cantidadAnterior: number;
        cancha: any;
      }>();

      // Contar reservas del mes actual
      reservasMes.forEach((reserva: any) => {
        const canchaId = reserva.cancha_id || reserva.id_cancha;
        if (!canchaStats.has(canchaId)) {
          const cancha = todasCanchas.find((c: any) => c.id_cancha === canchaId || c.id === canchaId);
          canchaStats.set(canchaId, { cantidad: 0, cantidadAnterior: 0, cancha });
        }
        canchaStats.get(canchaId)!.cantidad++;
      });

      // Contar reservas del mes anterior
      reservasMesAnterior.forEach((reserva: any) => {
        const canchaId = reserva.cancha_id || reserva.id_cancha;
        if (canchaStats.has(canchaId)) {
          canchaStats.get(canchaId)!.cantidadAnterior++;
        }
      });

      const top_canchas = Array.from(canchaStats.entries())
        .map(([canchaId, stats]) => {
          const cancha = stats.cancha;
          if (!cancha) return null;

          const ocupacion_porcentaje = (stats.cantidad / (diasEnMes * horasPorDia)) * 100;
          
          // Calcular tendencia
          let tendencia: 'subida' | 'bajada' | 'estable' = 'estable';
          let variacion_porcentaje = 0;
          
          if (stats.cantidadAnterior > 0) {
            variacion_porcentaje = ((stats.cantidad - stats.cantidadAnterior) / stats.cantidadAnterior) * 100;
            if (variacion_porcentaje > 5) tendencia = 'subida';
            else if (variacion_porcentaje < -5) tendencia = 'bajada';
          } else if (stats.cantidad > 0) {
            tendencia = 'subida';
            variacion_porcentaje = 100;
          }

          return {
            cancha_id: canchaId,
            cancha_nombre: cancha.nombre_cancha || cancha.nombre || `Cancha ${canchaId}`,
            complejo_nombre: cancha.complejo_nombre || cancha.complejo || 'N/A',
            tipo_deporte: cancha.tipo_cancha || cancha.deporte || 'N/A',
            cantidad_reservas: stats.cantidad,
            ocupacion_porcentaje: Math.round(ocupacion_porcentaje * 100) / 100,
            tendencia,
            variacion_porcentaje: Math.round(variacion_porcentaje * 100) / 100
          };
        })
        .filter(c => c !== null)
        .sort((a, b) => b!.cantidad_reservas - a!.cantidad_reservas)
        .slice(0, 5);

      // 6. TOP 5 HORARIOS MÁS SOLICITADOS
      console.log('📊 Calculando top horarios...');
      
      const horarioStats = new Map<string, {
        cantidad: number;
        cantidadAnterior: number;
        ingresos: number;
        dia_semana: string;
        hora: string;
      }>();

      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

      // Analizar reservas del mes actual
      reservasMes.forEach((reserva: any) => {
        const fechaReserva = new Date(reserva.fecha_reserva || reserva.fecha);
        const diaSemana = diasSemana[fechaReserva.getDay()];
        const horaInicio = reserva.hora_inicio?.substring(0, 5) || '00:00';
        const key = `${diaSemana}-${horaInicio}`;

        if (!horarioStats.has(key)) {
          horarioStats.set(key, {
            cantidad: 0,
            cantidadAnterior: 0,
            ingresos: 0,
            dia_semana: diaSemana,
            hora: horaInicio
          });
        }
        
        const stats = horarioStats.get(key)!;
        stats.cantidad++;
        if (reserva.estado_pago === 'pagado' || reserva.estado === 'confirmada') {
          stats.ingresos += parseFloat(reserva.precio_total) || 0;
        }
      });

      // Analizar reservas del mes anterior
      reservasMesAnterior.forEach((reserva: any) => {
        const fechaReserva = new Date(reserva.fecha_reserva || reserva.fecha);
        const diaSemana = diasSemana[fechaReserva.getDay()];
        const horaInicio = reserva.hora_inicio?.substring(0, 5) || '00:00';
        const key = `${diaSemana}-${horaInicio}`;

        if (horarioStats.has(key)) {
          horarioStats.get(key)!.cantidadAnterior++;
        }
      });

      const top_horarios = Array.from(horarioStats.values())
        .map(stats => {
          let tendencia: 'subida' | 'bajada' | 'estable' = 'estable';
          let variacion_porcentaje = 0;

          if (stats.cantidadAnterior > 0) {
            variacion_porcentaje = ((stats.cantidad - stats.cantidadAnterior) / stats.cantidadAnterior) * 100;
            if (variacion_porcentaje > 5) tendencia = 'subida';
            else if (variacion_porcentaje < -5) tendencia = 'bajada';
          } else if (stats.cantidad > 0) {
            tendencia = 'subida';
            variacion_porcentaje = 100;
          }

          return {
            dia_semana: stats.dia_semana,
            hora_inicio: stats.hora,
            cantidad_reservas: stats.cantidad,
            ingresos: Math.round(stats.ingresos * 100) / 100,
            tendencia,
            variacion_porcentaje: Math.round(variacion_porcentaje * 100) / 100
          };
        })
        .sort((a, b) => b.cantidad_reservas - a.cantidad_reservas)
        .slice(0, 5);

      // Construir respuesta final
      const estadisticas = {
        metricas_generales: {
          usuarios_totales,
          canchas_registradas,
          cantidad_administradores,
          reservas_hoy
        },
        metricas_mensuales: {
          ganancias_mes: Math.round(ganancias_mes * 100) / 100,
          reservas_totales_mes,
          ocupacion_mensual: Math.round(ocupacion_mensual * 100) / 100,
          valoracion_promedio: Math.round(valoracion_promedio * 100) / 100
        },
        reservas_por_dia,
        reservas_por_deporte,
        top_canchas,
        top_horarios,
        fecha_generacion: new Date().toISOString(),
        periodo_analisis: `${hace30DiasStr} - ${hoyStr}`
      };

      console.log('✅ [SuperAdminService] Estadísticas generadas exitosamente');
      
      return { ok: true, data: estadisticas };
    } catch (error: any) {
      console.error('❌ [SuperAdminService] Error al obtener estadísticas:', error);
      return { 
        ok: false, 
        error: error.response?.data?.message || error.message || 'Error al obtener estadísticas completas' 
      };
    }
  }
}