/**
 * SERVICIO DE CANCHAS
 * ===================
 * Llama al endpoint del BFF para obtener las canchas disponibles
 */

import { apiBackend } from '../config/backend';
import { getNombreDeporteNormalizado, getDeporteId } from '../utils/deportesMap';
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
    // Normalizar el tipo de deporte de BD al formato del frontend
    let tipoNormalizado = backendCancha.deporte || 'futbol';
    // Mapeo inverso: BD → Frontend
    const mapeoInverso: Record<string, string> = {
      'basquetbol': 'basquet',
      'paddle': 'padel',
      'voleibol': 'volley',
      'futbolito': 'futbol_sala'
    };
    tipoNormalizado = mapeoInverso[tipoNormalizado] || tipoNormalizado;
    
    return {
      id: backendCancha.id_cancha,
      nombre: backendCancha.nombre,
      tipo: tipoNormalizado,
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
      // Campos de dimensiones e iluminación:
      iluminacion: backendCancha.iluminacion || false,
      largo: backendCancha.largo || 0,
      ancho: backendCancha.ancho || 0,
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
      iluminacion: backendCancha.iluminacion || false,
      largo: backendCancha.largo || 0,
      ancho: backendCancha.ancho || 0,
      estado: (backendCancha.activa ? 'disponible' : 'inactiva') as 'disponible' | 'inactiva'
    };
  }
};

/**
 * Adaptador para convertir datos del frontend al formato del backend FastAPI
 * 
 * SCHEMA EXACTO según API de FastAPI para CREATE:
 * {
 *   "nombre": string (required),
 *   "id_complejo": number (required),
 *   "deporte": string (required) - Acepta: futbol, basquet, tenis, padel, volley,
 *   "cubierta": boolean (required),
 *   // Campos opcionales:
 *   "precio_por_hora": number,
 *   "capacidad": number,
 *   "descripcion": string,
 *   "iluminacion": boolean,
 *   "largo": number,
 *   "ancho": number,
 *   "imagen_url": string
 * }
 * 
 * UPDATE (CanchaUpdateIn):
 *   - nombre (optional)
 *   - deporte (optional) - Acepta: futbol, basquet, tenis, padel, volley
 *   - cubierta (optional)
 *   - activo (optional)
 *   - precio_por_hora, capacidad, descripcion, iluminacion, largo, ancho, imagen_url (optional)
 */
const adaptCanchaToBackend = (frontendCancha: CreateCanchaInput | UpdateCanchaInput, isUpdate: boolean = false) => {
  const payload: any = {};

  // === CAMPOS PARA CREATE ===
  if (!isUpdate) {
    // Obligatorios
    payload.nombre = frontendCancha.nombre;

    // DEPORTE: Normalizar nombre usando el mapeo
    if ((frontendCancha as any).tipo !== undefined) {
      payload.deporte = getNombreDeporteNormalizado((frontendCancha as any).tipo);
      console.log(`🏀 [adaptCanchaToBackend] Deporte normalizado: ${(frontendCancha as any).tipo} → ${payload.deporte}`);
    }

    // ID_COMPLEJO: CRÍTICO - debe ser número entero
    if ((frontendCancha as any).establecimientoId !== undefined) {
      const idComplejo = Number((frontendCancha as any).establecimientoId);
      if (isNaN(idComplejo) || idComplejo <= 0) {
        throw new Error(`ID de complejo inválido: ${(frontendCancha as any).establecimientoId}`);
      }
      payload.id_complejo = idComplejo;
      console.log(`🏢 [adaptCanchaToBackend] ID Complejo: ${idComplejo}`);
    }

    // CUBIERTA: convertir techada a cubierta
    payload.cubierta = Boolean((frontendCancha as any).techada);

    // ACTIVA: agregar campo activa (opcional, default true)
    payload.activa = (frontendCancha as any).activa !== undefined ? Boolean((frontendCancha as any).activa) : true;

    // Opcionales - enviar si están definidos y convertir explícitamente a número
    const precioPorHora = Number((frontendCancha as any).precioPorHora);
    if (!isNaN(precioPorHora) && precioPorHora > 0) {
      payload.precio_por_hora = precioPorHora;
    }

    const capacidad = Number((frontendCancha as any).capacidad);
    if (!isNaN(capacidad) && capacidad > 0) {
      payload.capacidad = capacidad;
    }

    if ((frontendCancha as any).descripcion !== undefined && (frontendCancha as any).descripcion.trim()) {
      payload.descripcion = (frontendCancha as any).descripcion;
    }

    if ((frontendCancha as any).iluminacion !== undefined) {
      payload.iluminacion = Boolean((frontendCancha as any).iluminacion);
    }

    const largo = Number((frontendCancha as any).largo);
    if (!isNaN(largo) && largo > 0) {
      payload.largo = largo;
    }

    const ancho = Number((frontendCancha as any).ancho);
    if (!isNaN(ancho) && ancho > 0) {
      payload.ancho = ancho;
    }

    if ((frontendCancha as any).imagenUrl !== undefined && (frontendCancha as any).imagenUrl) {
      payload.imagen_url = (frontendCancha as any).imagenUrl;
    }
  }

  // === CAMPOS PARA UPDATE ===
  if (isUpdate) {
    // nombre - OPCIONAL
    if (frontendCancha.nombre !== undefined) {
      payload.nombre = frontendCancha.nombre;
    }

    // tipo/deporte - OPCIONAL - Normalizar y enviar como "tipo" (el BFF lo convertirá a "deporte")
    if ((frontendCancha as any).tipo !== undefined) {
      payload.tipo = getNombreDeporteNormalizado((frontendCancha as any).tipo);
      console.log(`🏀 [adaptCanchaToBackend UPDATE] Deporte normalizado: ${(frontendCancha as any).tipo} → ${payload.tipo}`);
    }

    // techada - OPCIONAL (enviar como "techada", el BFF lo convertirá a "cubierta")
    if ((frontendCancha as any).techada !== undefined) {
      payload.techada = Boolean((frontendCancha as any).techada);
    }

    // activa - OPCIONAL (enviar como "activa", el BFF lo convertirá a "activo")
    if ((frontendCancha as any).activa !== undefined) {
      payload.activa = Boolean((frontendCancha as any).activa);
    }

    // precioPorHora - OPCIONAL
    if ((frontendCancha as any).precioPorHora !== undefined) {
      payload.precioPorHora = Number((frontendCancha as any).precioPorHora);
    }

    // capacidad - OPCIONAL
    if ((frontendCancha as any).capacidad !== undefined) {
      payload.capacidad = Number((frontendCancha as any).capacidad);
    }

    // descripcion - OPCIONAL
    if ((frontendCancha as any).descripcion !== undefined) {
      payload.descripcion = (frontendCancha as any).descripcion;
    }

    // imagenUrl - OPCIONAL
    if ((frontendCancha as any).imagenUrl !== undefined) {
      payload.imagenUrl = (frontendCancha as any).imagenUrl;
    }

    // iluminacion - OPCIONAL
    if ((frontendCancha as any).iluminacion !== undefined) {
      payload.iluminacion = Boolean((frontendCancha as any).iluminacion);
    }

    // largo - OPCIONAL
    if ((frontendCancha as any).largo !== undefined) {
      payload.largo = Number((frontendCancha as any).largo);
    }

    // ancho - OPCIONAL
    if ((frontendCancha as any).ancho !== undefined) {
      payload.ancho = Number((frontendCancha as any).ancho);
    }
  }

  console.log(`🔄 [adaptCanchaToBackend] ${isUpdate ? 'UPDATE' : 'CREATE'} payload final:`, payload);
  return payload;
};

export const canchaService = {
  /**
   * Verificar estado del módulo de canchas (NUEVO)
   * Endpoint público para diagnóstico
   */
  async getCanchasStatus(): Promise<any> {
    try {
      const { data } = await apiBackend.get('/canchas/status');
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
      const params: any = {};
      
      // Solo agregar parámetros que tengan valores válidos
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value;
        }
      });
      
      if (filters?.techada !== undefined && filters?.cubierta === undefined) {
        params.cubierta = filters.techada;
      }
      
      console.log('📤 Enviando petición a /canchas con parámetros:', params);
      
      const response = await apiBackend.get('/canchas', { params });
      
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
        // Formato: { items: [...], total: X } (común en FastAPI)
        canchas = response.data.items;
        pagination = {
          total: response.data.total,
          page: response.data.page,
          page_size: response.data.page_size
        };
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
      const response = await apiBackend.get(`/canchas/${id}`, { params });
      
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
      // Convertir tipos correctamente para evitar que query params sean strings
      const params: any = {
        sort_by: filters?.sort_by || 'nombre',
        order: filters?.order || 'asc',
        page: filters?.page || 1,
        page_size: filters?.page_size || 20,
        // ✅ CORRECTO: Incluir inactivas por defecto para panel admin
        // El admin debe ver TODAS sus canchas (activas e inactivas/archivadas)
        incluir_inactivas: filters?.incluir_inactivas !== false, // true por defecto
      };
      
      // Solo agregar parámetros opcionales si existen
      if (filters?.id_complejo) params.id_complejo = filters.id_complejo;
      if (filters?.q) params.q = filters.q;
      
      const response = await apiBackend.get('/canchas/admin', { params });
      
      console.log('🔍 [getCanchasAdmin] Response completa:', response.data);
      console.log('🔍 [getCanchasAdmin] Items:', response.data?.items);
      
      // El interceptor de apiBackend ya extrajo los datos de { ok, data }
      // Ahora response.data contiene directamente { items, total, page, page_size }
      const data = response.data;
      const canchas = data?.items || [];
      const pagination = {
        total: data?.total,
        page: data?.page,
        page_size: data?.page_size
      };
      
      console.log('✅ [getCanchasAdmin] Canchas antes de adaptar:', canchas.length);
      
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
      const backendData = adaptCanchaToBackend(input, false);
      console.log('📤 [canchaService] Creando cancha:', { nombre: input.nombre, tipo: input.tipo, payload: backendData });
      
      // 🔥 ACTUALIZADO: Endpoint correcto con autenticación
      // El control de permisos lo hace el middleware authMiddleware + requireRole
      const response = await apiBackend.post('/canchas', backendData);
      
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
      
      console.log('✅ [canchaService] Cancha creada:', canchaData.nombre);
      return adaptCanchaFromBackend(canchaData);
    } catch (error: any) {
      console.error('❌ [canchaService] Error:', error.message);
      
      // 🔥 IMPORTANTE: Propagar el objeto error completo con el status para que el componente pueda detectar 403
      // Extraer el mensaje de error más específico
      const errorDetail = error.response?.data?.error || error.response?.data;
      const errorMsg = errorDetail?.message || errorDetail?.detail || error.message || 'Error desconocido al crear la cancha';
      
      // Crear error personalizado que incluya el response
      const customError = new Error(errorMsg) as any;
      customError.response = error.response;
      throw customError;
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
      const response = await apiBackend.patch(`/canchas/${id}`, backendData);
      
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
      console.log(`🗑️ [canchaService] Eliminando cancha ID: ${id}`);
      console.log(`🗑️ [canchaService] Endpoint: DELETE /canchas/${id}`);
      
      // 🔥 ACTUALIZADO: Endpoint correcto con autenticación
      const response = await apiBackend.delete(`/canchas/${id}`);
      
      console.log('✅ [canchaService] Respuesta DELETE:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      // DELETE puede devolver 204 No Content (sin body) o 200 con confirmación
      return response.data || { success: true };
    } catch (error: any) {
      console.error(`❌ [canchaService] Error al eliminar cancha ${id}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method
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
      const response = await apiBackend.get(`/canchas/${id}/fotos`);
      
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
      const response = await apiBackend.post(`/canchas/${id}/fotos`, fotoData);
      
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
      await apiBackend.delete(`/canchas/${canchaId}/fotos/${fotoId}`);
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
