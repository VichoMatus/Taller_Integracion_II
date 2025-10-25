/**
 * SERVICIO DE CANCHAS
 * ===================
 * Llama al endpoint del BFF para obtener las canchas disponibles
 */

import { apiBackend } from '../config/backend';
import { 
  CreateCanchaInput, 
  UpdateCanchaInput, 
  FotoCancha, 
  AddFotoInput,
  CanchaBackendResponse 
} from '../types/cancha';

/**
 * Adaptador para convertir datos del backend al formato del frontend
 * Maneja el formato FastAPI (snake_case) según CanchaOut
 * 
 * CanchaOut devuelve:
 * - id_cancha, nombre, deporte, cubierta, activo, id_complejo (campos base)
 * - precio_desde, rating_promedio, total_reviews (campos calculados - read only)
 * - disponible_hoy, foto_principal (campos opcionales)
 */
const adaptCanchaFromBackend = (backendCancha: any) => {
  // Detectar qué formato está usando el backend
  const usaSnakeCase = 'id_cancha' in backendCancha;
  
  if (usaSnakeCase) {
    // Formato FastAPI (snake_case) - CanchaOut
    return {
      id: backendCancha.id_cancha,
      nombre: backendCancha.nombre,
      tipo: backendCancha.deporte || 'futbol',
      techada: backendCancha.cubierta || false,
      activa: backendCancha.activo !== undefined ? backendCancha.activo : true,
      establecimientoId: backendCancha.id_complejo,
      // Campos opcionales de solo lectura:
      precioPorHora: backendCancha.precio_desde,
      rating: backendCancha.rating_promedio,
      totalResenas: backendCancha.total_resenas,
      distanciaKm: backendCancha.distancia_km,
      descripcion: backendCancha.descripcion,
      capacidad: backendCancha.capacidad,
      imagenUrl: backendCancha.foto_principal,
      fechaCreacion: backendCancha.fecha_creacion,
      fechaActualizacion: backendCancha.fecha_actualizacion,
      // Campo calculado para UI basado en activo:
      estado: (backendCancha.activo ? 'disponible' : 'inactiva') as 'disponible' | 'inactiva'
    };
  } else {
    // Formato BFF Node.js (camelCase) - legacy support
    return {
      id: backendCancha.id,
      nombre: backendCancha.nombre,
      tipo: backendCancha.tipo || 'futbol',
      techada: backendCancha.techada || false,
      activa: backendCancha.activa !== undefined ? backendCancha.activa : true,
      establecimientoId: backendCancha.establecimientoId,
      precioPorHora: backendCancha.precioPorHora,
      descripcion: backendCancha.descripcion,
      capacidad: backendCancha.capacidad,
      imagenUrl: backendCancha.imagenUrl,
      fechaCreacion: backendCancha.fechaCreacion,
      fechaActualizacion: backendCancha.fechaActualizacion,
      estado: (backendCancha.activa ? 'disponible' : 'inactiva') as 'disponible' | 'inactiva'
    };
  }
};

/**
 * Adaptador para convertir datos del frontend al formato del backend FastAPI
 * 
 * SCHEMA EXACTO según API de FastAPI para CREATE:
 * {
 *   "id_complejo": number (required),
 *   "nombre": string (required),
 *   "id_deporte": number (optional),
 *   "deporte": string (optional),
 *   "cubierta": boolean (optional, default: false)
 * }
 * 
 * UPDATE (CanchaUpdateIn):
 *   - nombre (optional)
 *   - deporte (optional)
 *   - cubierta (optional)
 *   - activo (optional)
 */
const adaptCanchaToBackend = (frontendCancha: CreateCanchaInput | UpdateCanchaInput, isUpdate: boolean = false) => {
  const payload: any = {};

  // === CAMPOS PARA CREATE ===
  if (!isUpdate) {
    // id_complejo - REQUERIDO para CREATE
    if ((frontendCancha as any).establecimientoId !== undefined) {
      payload.id_complejo = (frontendCancha as any).establecimientoId;
    }

    // nombre - REQUERIDO para CREATE
    if (frontendCancha.nombre !== undefined) {
      payload.nombre = frontendCancha.nombre;
    }

    // id_deporte - OPCIONAL
    if ((frontendCancha as any).id_deporte !== undefined) {
      payload.id_deporte = (frontendCancha as any).id_deporte;
    }

    // deporte - OPCIONAL (nombre del deporte)
    if ((frontendCancha as any).tipo !== undefined) {
      payload.deporte = (frontendCancha as any).tipo;
    }

    // cubierta - OPCIONAL (default: false)
    if ((frontendCancha as any).techada !== undefined) {
      payload.cubierta = (frontendCancha as any).techada;
    } else {
      payload.cubierta = false; // Default explícito
    }
  }

  // === CAMPOS PARA UPDATE ===
  if (isUpdate) {
    // nombre - OPCIONAL
    if (frontendCancha.nombre !== undefined) {
      payload.nombre = frontendCancha.nombre;
    }

    // deporte - OPCIONAL
    if ((frontendCancha as any).tipo !== undefined) {
      payload.deporte = (frontendCancha as any).tipo;
    }

    // cubierta - OPCIONAL
    if ((frontendCancha as any).techada !== undefined) {
      payload.cubierta = (frontendCancha as any).techada;
    }

    // id_deporte - OPCIONAL
    if ((frontendCancha as any).id_deporte !== undefined) {
      payload.id_deporte = (frontendCancha as any).id_deporte;
    }

    // activo - OPCIONAL
    if ((frontendCancha as any).activa !== undefined) {
      payload.activo = (frontendCancha as any).activa;
    }
  }

  return payload;
};

export const canchaService = {
  /**
   * Verificar estado del módulo de canchas (NUEVO)
   * Endpoint público para diagnóstico
   */
  async getCanchasStatus(): Promise<any> {
    try {
      const { data } = await apiBackend.get('/api/canchas/status');
      return data;
    } catch (err) {
      console.warn('No se pudo obtener el estado del módulo canchas:', err);
      return { ok: false, error: 'Módulo no disponible' };
    }
  },

  /**
   * Obtener todas las canchas disponibles (ACTUALIZADO con filtros avanzados)
   * Soporte para nuevos filtros de Taller4: geolocalización, deporte, cubierta, etc.
   */
  async getCanchas(filters?: {
    // Filtros básicos
    q?: string;
    page?: number;
    page_size?: number;
    id_complejo?: number;
    
    // Filtros deportivos
    deporte?: string;
    cubierta?: boolean;
    techada?: boolean; // Alias para cubierta (retrocompatibilidad)
    iluminacion?: boolean;
    
    // Filtros económicos
    max_precio?: number;
    
    // Filtros geográficos (NUEVO)
    lat?: number;
    lon?: number;
    max_km?: number;
    
    // Ordenamiento (NUEVO)
    sort_by?: 'distancia' | 'precio' | 'rating' | 'nombre' | 'recientes';
    order?: 'asc' | 'desc';
  }) {
    try {
      // Preparar parámetros con soporte para ambos formatos (cubierta/techada)
      const params = { ...filters };
      if (filters?.techada !== undefined && filters?.cubierta === undefined) {
        params.cubierta = filters.techada;
      }
      
      const response = await apiBackend.get('/api/canchas', { params });
      
      // Manejar diferentes estructuras de respuesta del backend
      let canchas = [];
      let pagination = {};
      
      if (response.data?.ok && response.data?.data) {
        // Formato: { ok: true, data: { items: [...], total: X, page: Y } }
        const data = response.data.data;
        canchas = data.items || data;
        pagination = {
          total: data.total,
          page: data.page,
          page_size: data.page_size
        };
      } else if (response.data?.items) {
        // Formato: { items: [...] }
        canchas = response.data.items;
      } else if (Array.isArray(response.data)) {
        // Formato: [...]
        canchas = response.data;
      } else {
        console.warn('Formato de respuesta inesperado:', response.data);
        return { items: [], ...pagination };
      }

      // Adaptar cada cancha al formato esperado por el frontend
      const adaptedCanchas = canchas.map(adaptCanchaFromBackend);
      
      return {
        items: adaptedCanchas,
        ...pagination
      };
    } catch (error: any) {
      console.error('Error al obtener canchas:', error);
      // Manejo de error si la URL no responde o hay error de red
      if (error.response) {
        throw new Error('Error al obtener canchas: ' + (error.response.data?.message || error.response.statusText));
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor de canchas. Verifica la URL o tu conexión.');
      } else {
        throw new Error('Error inesperado: ' + error.message);
      }
    }
  },

  /**
   * Obtener una cancha por ID (ACTUALIZADO con distancia opcional)
   * Soporte para cálculo de distancia con coordenadas del usuario
   */
  async getCanchaById(id: number, coords?: { lat: number; lon: number }) {
    try {
      const params = coords ? { lat: coords.lat, lon: coords.lon } : {};
      const response = await apiBackend.get(`/api/canchas/${id}`, { params });
      
      // Adaptar la respuesta del backend
      let canchaData = response.data;
      if (response.data?.ok && response.data?.data) {
        canchaData = response.data.data;
      }
      
      return adaptCanchaFromBackend(canchaData);
    } catch (error: any) {
      throw new Error('Error al obtener la cancha: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener canchas para panel administrativo (NUEVO)
   * Requiere autenticación admin/super_admin
   */
  async getCanchasAdmin(filters?: {
    id_complejo?: number;
    q?: string;
    incluir_inactivas?: boolean;
    sort_by?: 'nombre' | 'precio' | 'rating' | 'recientes';
    order?: 'asc' | 'desc';
    page?: number;
    page_size?: number;
  }) {
    try {
      const params = { ...filters };
      const response = await apiBackend.get('/api/canchas/admin', { params });
      
      let canchas = [];
      let pagination = {};
      
      if (response.data?.ok && response.data?.data) {
        const data = response.data.data;
        canchas = data.items || data;
        pagination = {
          total: data.total,
          page: data.page,
          page_size: data.page_size
        };
      }
      
      return {
        items: canchas.map(adaptCanchaFromBackend),
        ...pagination
      };
    } catch (error: any) {
      throw new Error('Error al obtener canchas admin: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Crear una nueva cancha
   */
  async createCancha(input: CreateCanchaInput) {
    try {
      // Verificar estado de autenticación antes de enviar
      const token = typeof window !== 'undefined' ? (localStorage.getItem('access_token') || localStorage.getItem('token')) : null;
      console.log('🔐 [canchaService] Estado de autenticación:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 30)}...` : 'No token'
      });
      
      const backendData = adaptCanchaToBackend(input, false); // false = CREATE
      console.log('📤 [canchaService] Enviando datos para crear cancha:', backendData);
      console.log('📤 [canchaService] Input original:', input);
      
      // 🔥 ACTUALIZADO: Endpoint correcto con autenticación
      // El control de permisos lo hace el middleware authMiddleware + requireRole
      const response = await apiBackend.post('/api/canchas', backendData);
      
      console.log('📥 [canchaService] Respuesta completa del backend:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      // Adaptar la respuesta
      let canchaData = response.data;
      if (response.data?.data) {
        canchaData = response.data.data;
      }
      
      console.log('✅ [canchaService] Cancha creada exitosamente:', canchaData);
      return adaptCanchaFromBackend(canchaData);
    } catch (error: any) {
      console.error('❌ [canchaService] Error al crear cancha:', {
        message: error.message,
        response: error.response,
        responseData: error.response?.data,
        responseDataType: typeof error.response?.data,
        responseDataKeys: error.response?.data ? Object.keys(error.response.data) : [],
        responseDataFull: JSON.stringify(error.response?.data, null, 2),
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: error.config
      });
      
      // Extraer el mensaje de error más específico
      const errorDetail = error.response?.data?.error || error.response?.data;
      const errorMsg = errorDetail?.message || errorDetail?.detail || error.message || 'Error desconocido al crear la cancha';
      throw new Error(errorMsg);
    }
  },

  /**
   * Actualizar una cancha existente
   */
  async updateCancha(id: number, input: UpdateCanchaInput) {
    try {
      const backendData = adaptCanchaToBackend(input, true); // true = UPDATE
      console.log(`📤 [canchaService] Enviando datos para actualizar cancha ${id}:`, backendData);
      // 🔥 ACTUALIZADO: Endpoint correcto con autenticación
      // El backend usa PATCH, no PUT
      const response = await apiBackend.patch(`/api/canchas/${id}`, backendData);
      
      // Adaptar la respuesta
      let canchaData = response.data;
      if (response.data?.data) {
        canchaData = response.data.data;
      }
      
      console.log('✅ [canchaService] Cancha actualizada exitosamente:', canchaData);
      return adaptCanchaFromBackend(canchaData);
    } catch (error: any) {
      console.error(`❌ [canchaService] Error al actualizar cancha ${id}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMsg = error.message || error.response?.data?.message || error.response?.data?.detail || 'Error desconocido al actualizar la cancha';
      throw new Error(errorMsg);
    }
  },

  /**
   * Eliminar una cancha
   */
  async deleteCancha(id: number) {
    try {
      console.log(`🗑️ [canchaService] Eliminando cancha ${id}`);
      // 🔥 ACTUALIZADO: Endpoint correcto con autenticación
      const response = await apiBackend.delete(`/api/canchas/${id}`);
      console.log('✅ [canchaService] Cancha eliminada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error(`❌ [canchaService] Error al eliminar cancha ${id}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMsg = error.message || error.response?.data?.message || error.response?.data?.detail || 'Error desconocido al eliminar la cancha';
      throw new Error(errorMsg);
    }
  },

  /**
   * Obtener fotos de una cancha (ACTUALIZADO)
   * Endpoint público - no requiere autenticación
   */
  async getFotosCancha(id: number): Promise<FotoCancha[]> {
    try {
      const response = await apiBackend.get(`/api/canchas/${id}/fotos`);
      
      // Adaptar respuesta del backend
      let fotos = response.data;
      if (response.data?.ok && response.data?.data) {
        fotos = response.data.data;
      }
      
      return Array.isArray(fotos) ? fotos : [];
    } catch (error: any) {
      throw new Error('Error al obtener las fotos: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Agregar foto a una cancha (ACTUALIZADO)
   * Requiere autenticación admin/super_admin
   */
  async addFotoCancha(id: number, fotoData: AddFotoInput): Promise<FotoCancha> {
    try {
      const response = await apiBackend.post(`/api/canchas/${id}/fotos`, fotoData);
      
      // Adaptar respuesta del backend
      let foto = response.data;
      if (response.data?.ok && response.data?.data) {
        foto = response.data.data;
      }
      
      return foto;
    } catch (error: any) {
      throw new Error('Error al agregar la foto: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Eliminar foto de una cancha (ACTUALIZADO)
   * Requiere autenticación admin/super_admin
   */
  async deleteFotoCancha(canchaId: number, fotoId: number): Promise<void> {
    try {
      await apiBackend.delete(`/api/canchas/${canchaId}/fotos/${fotoId}`);
      // No retorna data para DELETE 204
    } catch (error: any) {
      throw new Error('Error al eliminar la foto: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Buscar canchas cercanas (NUEVA FUNCIONALIDAD)
   * Utiliza geolocalización para encontrar canchas por proximidad
   */
  async getCanchasCercanas(
    lat: number, 
    lon: number, 
    maxKm: number = 10,
    filters?: {
      deporte?: string;
      cubierta?: boolean;
      max_precio?: number;
    }
  ) {
    try {
      const params = {
        lat,
        lon,
        max_km: maxKm,
        sort_by: 'distancia' as const,
        order: 'asc' as const,
        ...filters
      };
      
      return await this.getCanchas(params);
    } catch (error: any) {
      throw new Error('Error al buscar canchas cercanas: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Buscar canchas por deporte (NUEVA FUNCIONALIDAD)
   */
  async getCanchasByDeporte(deporte: string, filters?: any) {
    try {
      return await this.getCanchas({ 
        deporte, 
        ...filters 
      });
    } catch (error: any) {
      throw new Error('Error al buscar canchas por deporte: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Buscar canchas techadas/cubiertas (NUEVA FUNCIONALIDAD)
   */
  async getCanchasTechadas(filters?: any) {
    try {
      return await this.getCanchas({ 
        cubierta: true, 
        ...filters 
      });
    } catch (error: any) {
      throw new Error('Error al buscar canchas techadas: ' + (error.response?.data?.message || error.message));
    }
  }
};

// Ejemplo de uso en un componente React:
// import { canchaService } from '../services/canchaService';
// useEffect(() => {
//   canchaService.getCanchas().then(data => setCanchas(data));
// }, []);
