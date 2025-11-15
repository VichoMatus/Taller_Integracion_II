/**
 * SERVICIO SUPERADMIN - CLIENTE HTTP PARA API FASTAPI
 * ===================================================
 * 
 * Este servicio actúa como un cliente HTTP que consume la API FastAPI hosteada en 
 * un servidor externo. Implementa el patrón Backend-for-Frontend (BFF), actuando 
 * como proxy entre el frontend React/Next.js y la API externa.
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
  
  // 🎯 SISTEMA DE CACHE TTL PARA ESTADÍSTICAS
  private estadisticasCache: Map<string, { data: any; expiry: number }> = new Map();
  private readonly CACHE_TTL_MINUTES = 10; // Cache por 10 minutos
  private readonly MAX_CONCURRENCY = 3; // Máximo 3 requests paralelos

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
   * 🎯 SISTEMA DE CACHE TTL
   * =======================
   */
  
  private getCacheKey(prefix: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${prefix}_${Buffer.from(paramsStr).toString('base64').slice(0, 20)}`;
  }

  private getCachedData(key: string): any | null {
    const cached = this.estadisticasCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      console.log(`💾 [Cache] HIT para clave: ${key}`);
      return cached.data;
    }
    if (cached) {
      console.log(`⏰ [Cache] EXPIRADO para clave: ${key}`);
      this.estadisticasCache.delete(key);
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    const expiry = Date.now() + (this.CACHE_TTL_MINUTES * 60 * 1000);
    this.estadisticasCache.set(key, { data, expiry });
    console.log(`💾 [Cache] SET para clave: ${key} (expira en ${this.CACHE_TTL_MINUTES}min)`);
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.estadisticasCache.entries()) {
      if (value.expiry <= now) {
        this.estadisticasCache.delete(key);
      }
    }
  }

  /**
   * ⚡ SISTEMA DE FETCH PARALELO CON CONCURRENCIA
   * =============================================
   */
  
  private async fetchAllParallel<T>(
    requests: Array<{ key: string; fn: () => Promise<T> }>,
    maxConcurrency: number = this.MAX_CONCURRENCY
  ): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};
    
    console.log(`⚡ [Parallel] Iniciando ${requests.length} requests con concurrencia máxima ${maxConcurrency}`);
    const startTime = performance.now();
    
    // Ejecutar requests en lotes con concurrencia limitada
    for (let i = 0; i < requests.length; i += maxConcurrency) {
      const batch = requests.slice(i, i + maxConcurrency);
      console.log(`⚡ [Parallel] Lote ${Math.floor(i / maxConcurrency) + 1}: ${batch.map(r => r.key).join(', ')}`);
      
      const batchPromises = batch.map(async ({ key, fn }) => {
        try {
          const result = await fn();
          console.log(`✅ [Parallel] ${key} completado`);
          return { key, result };
        } catch (error) {
          console.error(`❌ [Parallel] ${key} falló:`, error);
          return { key, result: null as T | null };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ key, result }) => {
        results[key] = result;
      });
    }
    
    const endTime = performance.now();
    console.log(`⚡ [Parallel] Completado en ${Math.round(endTime - startTime)}ms`);
    
    return results;
  }

  /**
   * 🔧 FUNCIONES AUXILIARES PARA PARSEO ROBUSTO DE RESPUESTAS
   * =========================================================
   * Estas funciones extraen datos de diferentes formatos de respuesta de FastAPI
   */

  /**
   * Extrae array de usuarios de la respuesta, probando múltiples formatos
   */
  private extraerUsuarios(response: any): any[] {
    if (!response || !response.data) {
      console.warn('⚠️ [Parser] Response de usuarios vacía o inválida');
      return [];
    }

    const data = response.data;
    
    // Formato 1: { data: { usuarios: [...] } }
    if (data.usuarios && Array.isArray(data.usuarios)) {
      console.log(`✅ [Parser] Usuarios encontrados en data.usuarios: ${data.usuarios.length}`);
      return data.usuarios;
    }
    
    // Formato 2: { data: { data: { usuarios: [...] } } }
    if (data.data && data.data.usuarios && Array.isArray(data.data.usuarios)) {
      console.log(`✅ [Parser] Usuarios encontrados en data.data.usuarios: ${data.data.usuarios.length}`);
      return data.data.usuarios;
    }
    
    // Formato 3: { data: [...] } (array directo)
    if (Array.isArray(data)) {
      console.log(`✅ [Parser] Usuarios como array directo: ${data.length}`);
      return data;
    }
    
    // Formato 4: { data: { data: [...] } }
    if (data.data && Array.isArray(data.data)) {
      console.log(`✅ [Parser] Usuarios en data.data como array: ${data.data.length}`);
      return data.data;
    }

    // Formato 5: { data: { results: [...] } }
    if (data.results && Array.isArray(data.results)) {
      console.log(`✅ [Parser] Usuarios encontrados en data.results: ${data.results.length}`);
      return data.results;
    }

    // Formato 6: { data: { items: [...] } }
    if (data.items && Array.isArray(data.items)) {
      console.log(`✅ [Parser] Usuarios encontrados en data.items: ${data.items.length}`);
      return data.items;
    }

    console.warn('⚠️ [Parser] No se pudo extraer usuarios de la respuesta. Estructura:', Object.keys(data));
    return [];
  }

  /**
   * Extrae array de canchas de la respuesta
   */
  private extraerCanchas(response: any): any[] {
    if (!response || !response.data) {
      console.warn('⚠️ [Parser] Response de canchas vacía o inválida');
      return [];
    }

    const data = response.data;
    
    // Formato 1: { data: { canchas: [...] } }
    if (data.canchas && Array.isArray(data.canchas)) {
      console.log(`✅ [Parser] Canchas encontradas en data.canchas: ${data.canchas.length}`);
      return data.canchas;
    }
    
    // Formato 2: { data: { data: { canchas: [...] } } }
    if (data.data && data.data.canchas && Array.isArray(data.data.canchas)) {
      console.log(`✅ [Parser] Canchas encontradas en data.data.canchas: ${data.data.canchas.length}`);
      return data.data.canchas;
    }
    
    // Formato 3: { data: [...] } (array directo)
    if (Array.isArray(data)) {
      console.log(`✅ [Parser] Canchas como array directo: ${data.length}`);
      return data;
    }
    
    // Formato 4: { data: { data: [...] } }
    if (data.data && Array.isArray(data.data)) {
      console.log(`✅ [Parser] Canchas en data.data como array: ${data.data.length}`);
      return data.data;
    }

    // Formato 5: { data: { results: [...] } }
    if (data.results && Array.isArray(data.results)) {
      console.log(`✅ [Parser] Canchas encontradas en data.results: ${data.results.length}`);
      return data.results;
    }

    // Formato 6: { data: { items: [...] } }
    if (data.items && Array.isArray(data.items)) {
      console.log(`✅ [Parser] Canchas encontradas en data.items: ${data.items.length}`);
      return data.items;
    }

    console.warn('⚠️ [Parser] No se pudo extraer canchas de la respuesta. Estructura:', Object.keys(data));
    return [];
  }

  /**
   * Extrae array de reservas de la respuesta
   */
  private extraerReservas(response: any): any[] {
    if (!response || !response.data) {
      console.warn('⚠️ [Parser] Response de reservas vacía o inválida');
      return [];
    }

    const data = response.data;
    
    // Formato 1: { data: { reservas: [...] } }
    if (data.reservas && Array.isArray(data.reservas)) {
      console.log(`✅ [Parser] Reservas encontradas en data.reservas: ${data.reservas.length}`);
      return data.reservas;
    }
    
    // Formato 2: { data: { data: { reservas: [...] } } }
    if (data.data && data.data.reservas && Array.isArray(data.data.reservas)) {
      console.log(`✅ [Parser] Reservas encontradas en data.data.reservas: ${data.data.reservas.length}`);
      return data.data.reservas;
    }
    
    // Formato 3: { data: [...] } (array directo)
    if (Array.isArray(data)) {
      console.log(`✅ [Parser] Reservas como array directo: ${data.length}`);
      return data;
    }
    
    // Formato 4: { data: { data: [...] } }
    if (data.data && Array.isArray(data.data)) {
      console.log(`✅ [Parser] Reservas en data.data como array: ${data.data.length}`);
      return data.data;
    }

    // Formato 5: { data: { results: [...] } }
    if (data.results && Array.isArray(data.results)) {
      console.log(`✅ [Parser] Reservas encontradas en data.results: ${data.results.length}`);
      return data.results;
    }

    // Formato 6: { data: { items: [...] } }
    if (data.items && Array.isArray(data.items)) {
      console.log(`✅ [Parser] Reservas encontradas en data.items: ${data.items.length}`);
      return data.items;
    }

    console.warn('⚠️ [Parser] No se pudo extraer reservas de la respuesta. Estructura:', Object.keys(data));
    return [];
  }

  /**
   * Extrae array de reseñas de la respuesta
   */
  private extraerResenas(response: any): any[] {
    if (!response || !response.data) {
      console.warn('⚠️ [Parser] Response de reseñas vacía o inválida');
      return [];
    }

    const data = response.data;
    
    // Formato 1: { data: { resenas: [...] } }
    if (data.resenas && Array.isArray(data.resenas)) {
      console.log(`✅ [Parser] Reseñas encontradas en data.resenas: ${data.resenas.length}`);
      return data.resenas;
    }
    
    // Formato 2: { data: { data: { resenas: [...] } } }
    if (data.data && data.data.resenas && Array.isArray(data.data.resenas)) {
      console.log(`✅ [Parser] Reseñas encontradas en data.data.resenas: ${data.data.resenas.length}`);
      return data.data.resenas;
    }
    
    // Formato 3: { data: [...] } (array directo)
    if (Array.isArray(data)) {
      console.log(`✅ [Parser] Reseñas como array directo: ${data.length}`);
      return data;
    }
    
    // Formato 4: { data: { data: [...] } }
    if (data.data && Array.isArray(data.data)) {
      console.log(`✅ [Parser] Reseñas en data.data como array: ${data.data.length}`);
      return data.data;
    }

    // Formato 5: { data: { results: [...] } }
    if (data.results && Array.isArray(data.results)) {
      console.log(`✅ [Parser] Reseñas encontradas en data.results: ${data.results.length}`);
      return data.results;
    }

    // Formato 6: { data: { items: [...] } }
    if (data.items && Array.isArray(data.items)) {
      console.log(`✅ [Parser] Reseñas encontradas en data.items: ${data.items.length}`);
      return data.items;
    }

    console.warn('⚠️ [Parser] No se pudo extraer reseñas de la respuesta. Estructura:', Object.keys(data));
    return [];
  }

  /**
   * Normaliza el campo de ID de cancha en una reserva
   */
  private obtenerIdCancha(reserva: any): number | null {
    // Probar diferentes campos comunes
    const posiblesIds = [
      reserva.cancha_id,
      reserva.id_cancha,
      reserva.canchaId,
      reserva.cancha?.id,
      reserva.cancha?.id_cancha
    ];

    for (const id of posiblesIds) {
      if (id !== undefined && id !== null) {
        // Convertir a número si es string
        const numId = typeof id === 'string' ? parseInt(id, 10) : id;
        if (!isNaN(numId)) {
          return numId;
        }
      }
    }

    return null;
  }

  /**
   * Normaliza el campo de tipo de deporte de una cancha
   */
  private obtenerTipoDeporte(cancha: any): string {
    // Probar diferentes campos comunes
    const posiblesDeportes = [
      cancha.tipo_cancha,
      cancha.deporte,
      cancha.tipo_deporte,
      cancha.tipoCancha,
      cancha.sport,
      cancha.type
    ];

    for (const deporte of posiblesDeportes) {
      if (deporte && typeof deporte === 'string') {
        return deporte.toLowerCase();
      }
    }

    return 'otros';
  }

  /**
   * Normaliza el nombre de una cancha
   */
  private obtenerNombreCancha(cancha: any): string {
    const posiblesNombres = [
      cancha.nombre_cancha,
      cancha.nombre,
      cancha.name,
      cancha.nombreCancha
    ];

    for (const nombre of posiblesNombres) {
      if (nombre && typeof nombre === 'string') {
        return nombre;
      }
    }

    // Fallback con ID si existe
    const id = cancha.id_cancha || cancha.id;
    return id ? `Cancha ${id}` : 'Cancha sin nombre';
  }

  /**
   * Obtiene el nombre del complejo de una cancha
   */
  private obtenerNombreComplejo(cancha: any): string {
    const posiblesNombres = [
      cancha.complejo_nombre,
      cancha.complejo?.nombre,
      cancha.complejo?.nombre_complejo,
      cancha.nombreComplejo,
      cancha.complex_name
    ];

    for (const nombre of posiblesNombres) {
      if (nombre && typeof nombre === 'string') {
        return nombre;
      }
    }

    return 'N/A';
  }

  /**
   * Obtiene la fecha de una reserva de forma robusta
   */
  private obtenerFechaReserva(reserva: any): Date | null {
    const posiblesFechas = [
      reserva.fecha_reserva,
      reserva.fecha,
      reserva.date,
      reserva.fechaReserva,
      reserva.fecha_inicio,
      reserva.fechaInicio
    ];

    for (const fecha of posiblesFechas) {
      if (fecha) {
        try {
          const fechaObj = new Date(fecha);
          if (!isNaN(fechaObj.getTime())) {
            return fechaObj;
          }
        } catch (error) {
          // Continuar con la siguiente opción
        }
      }
    }

    return null;
  }

  /**
   * Obtiene la hora de inicio de una reserva
   */
  private obtenerHoraInicio(reserva: any): string | null {
    const posiblesHoras = [
      reserva.hora_inicio,
      reserva.horaInicio,
      reserva.start_time,
      reserva.hora
    ];

    for (const hora of posiblesHoras) {
      if (hora && typeof hora === 'string') {
        // Si tiene formato HH:MM:SS, tomar solo HH:MM
        return hora.substring(0, 5);
      }
    }

    return null;
  }

  /**
   * Verifica si una reserva está pagada/confirmada
   */
  private estaReservaPagada(reserva: any): boolean {
    const estadoPago = reserva.estado_pago || reserva.estadoPago || '';
    const estado = reserva.estado || reserva.status || '';
    
    return estadoPago === 'pagado' || 
           estadoPago === 'completado' ||
           estadoPago === 'paid' ||
           estado === 'confirmada' ||
           estado === 'completada' ||
           estado === 'confirmed' ||
           estado === 'completed';
  }

  /**
   * Obtiene el precio de una reserva
   */
  private obtenerPrecioReserva(reserva: any): number {
    const posiblesPrecios = [
      reserva.precio_total,
      reserva.precio,
      reserva.total,
      reserva.precioTotal,
      reserva.amount,
      reserva.monto
    ];

    for (const precio of posiblesPrecios) {
      if (precio !== undefined && precio !== null) {
        const precioNum = parseFloat(precio);
        if (!isNaN(precioNum)) {
          return precioNum;
        }
      }
    }

    return 0;
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
   * 🚀 ESTADÍSTICAS COMPLETAS OPTIMIZADAS CON CACHE Y PARALELIZACIÓN
   * ================================================================
   */
  async getEstadisticasCompletas(token?: string): Promise<ApiResponse> {
    try {
      // 1. Verificar cache primero
      const cacheKey = this.getCacheKey('estadisticas_completas', { token: token ? 'present' : 'none' });
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        console.log('💾 [SuperAdmin] Estadísticas servidas desde cache');
        return { ok: true, data: cachedData };
      }

      // 2. Limpiar cache expirado
      this.cleanExpiredCache();

      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log('� [SuperAdmin] Iniciando recopilación OPTIMIZADA de estadísticas...');
      const startTime = performance.now();

      // 3. Calcular fechas una sola vez
      const hoy = new Date();
      const hoyStr = hoy.toISOString().split('T')[0];
      const hace30Dias = new Date(hoy);
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      const hace30DiasStr = hace30Dias.toISOString().split('T')[0];
      
      const hace60Dias = new Date(hoy);
      hace60Dias.setDate(hace60Dias.getDate() - 60);
      const hace60DiasStr = hace60Dias.toISOString().split('T')[0];

      // 4. FETCH PARALELO CON CONCURRENCIA LIMITADA
      const requests = [
        {
          key: 'usuarios',
          fn: () => this.apiClient.get(API_ENDPOINTS.usuarios.base, { 
            headers,
            params: { page_size: 10000 }
          })
        },
        {
          key: 'canchas',
          fn: () => this.apiClient.get(API_ENDPOINTS.canchas.base, { 
            headers,
            params: { page_size: 10000 }
          })
        },
        {
          key: 'reservasHoy',
          fn: () => this.apiClient.get(API_ENDPOINTS.reservas.base, {
            headers,
            params: { 
              fecha_desde: hoyStr,
              fecha_hasta: hoyStr,
              page_size: 10000
            }
          })
        },
        {
          key: 'reservasMes',
          fn: () => this.apiClient.get(API_ENDPOINTS.reservas.base, {
            headers,
            params: {
              fecha_desde: hace30DiasStr,
              fecha_hasta: hoyStr,
              page_size: 10000
            }
          })
        },
        {
          key: 'reservasMesAnterior',
          fn: () => this.apiClient.get(API_ENDPOINTS.reservas.base, {
            headers,
            params: {
              fecha_desde: hace60DiasStr,
              fecha_hasta: hace30DiasStr,
              page_size: 10000
            }
          })
        },
        {
          key: 'resenas',
          fn: () => this.apiClient.get(API_ENDPOINTS.resenas.base, {
            headers,
            params: { page_size: 10000 }
          })
        }
      ];

      // 5. EJECUTAR REQUESTS EN PARALELO
      const responses = await this.fetchAllParallel(requests);

      // 6. EXTRAER Y VALIDAR DATOS CON PARSERS ROBUSTOS
      const todosUsuarios = this.extraerUsuarios(responses.usuarios);
      const todasCanchas = this.extraerCanchas(responses.canchas);
      const reservasHoy = this.extraerReservas(responses.reservasHoy);
      const reservasMes = this.extraerReservas(responses.reservasMes);
      const reservasMesAnterior = this.extraerReservas(responses.reservasMesAnterior);
      const resenas = this.extraerResenas(responses.resenas);

      console.log('📊 [Stats] Datos extraídos exitosamente:', {
        usuarios: todosUsuarios.length,
        canchas: todasCanchas.length,
        reservasHoy: reservasHoy.length,
        reservasMes: reservasMes.length,
        reservasMesAnterior: reservasMesAnterior.length,
        resenas: resenas.length
      });

      // Advertencia si algún array está vacío
      if (todosUsuarios.length === 0) console.warn('⚠️ [Stats] No se encontraron usuarios');
      if (todasCanchas.length === 0) console.warn('⚠️ [Stats] No se encontraron canchas');
      if (reservasMes.length === 0) console.warn('⚠️ [Stats] No se encontraron reservas del mes');

      // 7. CALCULAR MÉTRICAS DE FORMA EFICIENTE CON PARSEO ROBUSTO
      const usuarios_totales = todosUsuarios.length;
      
      // Contar administradores de forma robusta
      const cantidad_administradores = todosUsuarios.filter((u: any) => {
        const rol = u.rol || u.role || u.tipo_usuario;
        return rol === 'admin' || rol === 'super_admin' || rol === 'superadmin';
      }).length;
      
      const canchas_registradas = todasCanchas.length;
      const reservas_hoy = reservasHoy.length;

      // Ganancias del mes (solo reservas confirmadas/pagadas) CON PARSEO ROBUSTO
      const ganancias_mes = reservasMes
        .filter((r: any) => this.estaReservaPagada(r))
        .reduce((sum: number, r: any) => sum + this.obtenerPrecioReserva(r), 0);

      // Ocupación mensual
      const diasEnMes = 30;
      const horasPorDia = 14;
      const slotsDisponibles = canchas_registradas * diasEnMes * horasPorDia;
      const reservasConfirmadas = reservasMes.filter((r: any) => 
        r.estado === 'confirmada' || r.estado === 'completada'
      ).length;
      const ocupacion_mensual = slotsDisponibles > 0 
        ? (reservasConfirmadas / slotsDisponibles) * 100 
        : 0;

      // Valoración promedio CON PARSEO ROBUSTO
      const valoracion_promedio = resenas.length > 0
        ? resenas.reduce((sum: number, r: any) => {
            const calificacion = r.calificacion || r.rating || r.puntuacion || r.valoracion || 0;
            return sum + parseFloat(calificacion);
          }, 0) / resenas.length
        : 0;

      // 8. RESERVAS POR DÍA (últimos 30 días) CON PARSEO ROBUSTO
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
        const fechaObj = this.obtenerFechaReserva(reserva);
        if (!fechaObj) return;
        
        const fechaReserva = fechaObj.toISOString().split('T')[0];
        
        if (reservasPorDiaMap.has(fechaReserva)) {
          const data = reservasPorDiaMap.get(fechaReserva)!;
          data.cantidad++;
          
          if (this.estaReservaPagada(reserva)) {
            data.ingresos += this.obtenerPrecioReserva(reserva);
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
          ingresos: Math.round(data.ingresos * 100) / 100
        };
      });

      // 9. RESERVAS POR DEPORTE CON PARSEO ROBUSTO
      const reservasPorDeporteMap = new Map<string, { cantidad: number; ingresos: number }>();
      
      let reservasSinCancha = 0;
      reservasMes.forEach((reserva: any) => {
        const canchaId = this.obtenerIdCancha(reserva);
        
        if (!canchaId) {
          reservasSinCancha++;
          return;
        }
        
        // Buscar cancha con ID normalizado
        const cancha = todasCanchas.find((c: any) => {
          const cId = c.id_cancha || c.id;
          return cId === canchaId;
        });
        
        if (cancha) {
          const deporte = this.obtenerTipoDeporte(cancha);
          
          if (!reservasPorDeporteMap.has(deporte)) {
            reservasPorDeporteMap.set(deporte, { cantidad: 0, ingresos: 0 });
          }
          
          const data = reservasPorDeporteMap.get(deporte)!;
          data.cantidad++;
          
          if (this.estaReservaPagada(reserva)) {
            data.ingresos += this.obtenerPrecioReserva(reserva);
          }
        } else {
          reservasSinCancha++;
        }
      });

      if (reservasSinCancha > 0) {
        console.warn(`⚠️ [Stats] ${reservasSinCancha} reservas sin cancha asociada o ID inválido`);
      }

      const totalReservasDeporte = Array.from(reservasPorDeporteMap.values())
        .reduce((sum, d) => sum + d.cantidad, 0);

      const reservas_por_deporte = Array.from(reservasPorDeporteMap.entries()).map(([deporte, data]) => ({
        deporte,
        cantidad_reservas: data.cantidad,
        porcentaje: totalReservasDeporte > 0 ? Math.round((data.cantidad / totalReservasDeporte) * 10000) / 100 : 0,
        ingresos: Math.round(data.ingresos * 100) / 100
      })).sort((a, b) => b.cantidad_reservas - a.cantidad_reservas);

      // 10. TOP 5 CANCHAS MÁS POPULARES CON TENDENCIAS (PARSEO ROBUSTO)
      const canchaStats = new Map<number, { 
        cantidad: number; 
        cantidadAnterior: number;
        cancha: any;
      }>();

      // Contar reservas actuales
      reservasMes.forEach((reserva: any) => {
        const canchaId = this.obtenerIdCancha(reserva);
        if (!canchaId) return;
        
        if (!canchaStats.has(canchaId)) {
          const cancha = todasCanchas.find((c: any) => {
            const cId = c.id_cancha || c.id;
            return cId === canchaId;
          });
          canchaStats.set(canchaId, { cantidad: 0, cantidadAnterior: 0, cancha });
        }
        canchaStats.get(canchaId)!.cantidad++;
      });

      // Contar reservas del mes anterior
      reservasMesAnterior.forEach((reserva: any) => {
        const canchaId = this.obtenerIdCancha(reserva);
        if (!canchaId) return;
        
        if (canchaStats.has(canchaId)) {
          canchaStats.get(canchaId)!.cantidadAnterior++;
        }
      });

      const top_canchas = Array.from(canchaStats.entries())
        .map(([canchaId, stats]) => {
          const cancha = stats.cancha;
          if (!cancha) {
            console.warn(`⚠️ [Stats] Cancha ID ${canchaId} no encontrada en lista de canchas`);
            return null;
          }

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
            cancha_nombre: this.obtenerNombreCancha(cancha),
            complejo_nombre: this.obtenerNombreComplejo(cancha),
            tipo_deporte: this.obtenerTipoDeporte(cancha),
            cantidad_reservas: stats.cantidad,
            ocupacion_porcentaje: Math.round(ocupacion_porcentaje * 100) / 100,
            tendencia,
            variacion_porcentaje: Math.round(variacion_porcentaje * 100) / 100
          };
        })
        .filter(c => c !== null)
        .sort((a, b) => b!.cantidad_reservas - a!.cantidad_reservas)
        .slice(0, 5);

      // 11. TOP 5 HORARIOS MÁS SOLICITADOS CON PARSEO ROBUSTO
      const horarioStats = new Map<string, {
        cantidad: number;
        cantidadAnterior: number;
        ingresos: number;
        dia_semana: string;
        hora: string;
      }>();

      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

      // Analizar ambos meses
      [...reservasMes, ...reservasMesAnterior].forEach((reserva: any, index) => {
        const esActual = index < reservasMes.length;
        
        const fechaReserva = this.obtenerFechaReserva(reserva);
        if (!fechaReserva) return;
        
        const diaSemana = diasSemana[fechaReserva.getDay()];
        const horaInicio = this.obtenerHoraInicio(reserva) || '00:00';
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
        if (esActual) {
          stats.cantidad++;
          if (this.estaReservaPagada(reserva)) {
            stats.ingresos += this.obtenerPrecioReserva(reserva);
          }
        } else {
          stats.cantidadAnterior++;
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

      // 12. CONSTRUIR RESPUESTA FINAL OPTIMIZADA
      const endTime = performance.now();
      const tiempoEjecucion = Math.round(endTime - startTime);
      
      const estadisticas = {
        metricas_generales: {
          usuarios_totales,
          canchas_registradas,
          cantidad_administradores,
          reservas_hoy
        },
        metricas_mensuales: {
          ganancias_mes: Math.round(ganancias_mes * 100) / 100,
          reservas_totales_mes: reservasMes.length,
          ocupacion_mensual: Math.round(ocupacion_mensual * 100) / 100,
          valoracion_promedio: Math.round(valoracion_promedio * 100) / 100
        },
        reservas_por_dia,
        reservas_por_deporte,
        top_canchas,
        top_horarios,
        metadata: {
          fecha_generacion: new Date().toISOString(),
          periodo_analisis: `${hace30DiasStr} - ${hoyStr}`,
          tiempo_ejecucion_ms: tiempoEjecucion,
          cache_usado: false,
          requests_paralelos: requests.length
        }
      };

      // 13. GUARDAR EN CACHE
      this.setCachedData(cacheKey, estadisticas);

      console.log(`🚀 [SuperAdmin] Estadísticas generadas EXITOSAMENTE en ${tiempoEjecucion}ms`);
      
      return { ok: true, data: estadisticas };
    } catch (error: any) {
      console.error('❌ [SuperAdmin] Error al obtener estadísticas OPTIMIZADAS:', error);
      return { 
        ok: false, 
        error: error.response?.data?.message || error.message || 'Error al obtener estadísticas completas' 
      };
    }
  }

  /**
   * 📊 MÉTRICAS DE RENDIMIENTO Y CACHE
   * ==================================
   */
  getCacheMetrics(): any {
    const now = Date.now();
    const cacheEntries = Array.from(this.estadisticasCache.entries()).map(([key, value]) => ({
      key,
      expiresIn: Math.max(0, Math.round((value.expiry - now) / 1000)),
      size: JSON.stringify(value.data).length
    }));

    return {
      cache_size: this.estadisticasCache.size,
      cache_ttl_minutes: this.CACHE_TTL_MINUTES,
      max_concurrency: this.MAX_CONCURRENCY,
      entries: cacheEntries,
      total_cache_size_bytes: cacheEntries.reduce((sum, entry) => sum + entry.size, 0)
    };
  }

  /**
   * 🧹 LIMPIEZA MANUAL DE CACHE
   * ===========================
   */
  clearCache(): void {
    const oldSize = this.estadisticasCache.size;
    this.estadisticasCache.clear();
    console.log(`🧹 [Cache] Limpiado manualmente. Eliminadas ${oldSize} entradas`);
  }
}