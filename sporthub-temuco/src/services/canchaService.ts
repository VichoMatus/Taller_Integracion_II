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
 *   "nombre": string (required),
 *   "id_complejo": number (required),
 *   "deporte": string (required),
 *   "cubierta": boolean (required),
 *   "id_deporte": number (optional)
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
    payload.nombre = frontendCancha.nombre;

    if ((frontendCancha as any).tipo !== undefined) {
      payload.deporte = (frontendCancha as any).tipo;
    }

    if ((frontendCancha as any).establecimientoId !== undefined) {
      payload.id_complejo = Number((frontendCancha as any).establecimientoId);
    }

    payload.cubierta = (frontendCancha as any).techada !== undefined 
      ? (frontendCancha as any).techada 
      : false;

    if ((frontendCancha as any).id_deporte !== undefined && (frontendCancha as any).id_deporte !== 0) {
      payload.id_deporte = (frontendCancha as any).id_deporte;
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

    // precioPorHora - OPCIONAL
    if ((frontendCancha as any).precioPorHora !== undefined) {
      payload.precioPorHora = (frontendCancha as any).precioPorHora;
    }

    // capacidad - OPCIONAL
    if ((frontendCancha as any).capacidad !== undefined) {
      payload.capacidad = (frontendCancha as any).capacidad;
    }

    // descripcion - OPCIONAL
    if ((frontendCancha as any).descripcion !== undefined) {
      payload.descripcion = (frontendCancha as any).descripcion;
    }

    // imagenUrl - OPCIONAL
    if ((frontendCancha as any).imagenUrl !== undefined) {
      payload.imagenUrl = (frontendCancha as any).imagenUrl;
    }
  }

  return payload;
};

export const canchaService = {
  /**
   * Obtener todas las canchas disponibles
   */
  async getCanchas() {
    try {
      const response = await apiBackend.get('/canchas');
      
      // Manejar diferentes estructuras de respuesta del backend
      let canchas = [];
      
      if (response.data?.items) {
        // Formato: { items: [...] }
        canchas = response.data.items;
      } else if (Array.isArray(response.data)) {
        // Formato: [...]
        canchas = response.data;
      } else if (response.data?.data?.items) {
        // Formato: { data: { items: [...] } }
        canchas = response.data.data.items;
      } else {
        console.warn('Formato de respuesta inesperado:', response.data);
        return [];
      }

      // Adaptar cada cancha al formato esperado por el frontend
      return canchas.map(adaptCanchaFromBackend);
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
   * Obtener una cancha por ID
   */
  async getCanchaById(id: number) {
    try {
      const response = await apiBackend.get(`/canchas/${id}`);
      
      // Adaptar la respuesta del backend
      let canchaData = response.data;
      if (response.data?.data) {
        canchaData = response.data.data;
      }
      
      return adaptCanchaFromBackend(canchaData);
    } catch (error: any) {
      throw new Error('Error al obtener la cancha: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Crear una nueva cancha
   */
  async createCancha(input: CreateCanchaInput) {
    try {
      const backendData = adaptCanchaToBackend(input, false);
      console.log('📤 [canchaService] Creando cancha:', { nombre: input.nombre, tipo: input.tipo, payload: backendData });
      
      const response = await apiBackend.post('/canchas', backendData);
      
      let canchaData = response.data;
      if (response.data?.data) {
        canchaData = response.data.data;
      }
      
      console.log('✅ [canchaService] Cancha creada:', canchaData.nombre);
      return adaptCanchaFromBackend(canchaData);
    } catch (error: any) {
      console.error('❌ [canchaService] Error:', error.message);
      
      // Si el error ya tiene un mensaje válido del interceptor, usarlo directamente
      if (error.message && error.message !== '[object Object]') {
        throw error;
      }
      
      // Si no, intentar extraer del response
      let errorMsg = 'Error desconocido al crear la cancha';
      
      if (error.response?.data) {
        const data = error.response.data;
        errorMsg = typeof data === 'string' ? data : (data.detail || data.error || data.message || data.msg || JSON.stringify(data));
      }
      
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
      // 🔥 CORREGIDO: Endpoint es /canchas (no /admin/canchas)
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
      console.log(`🗑️ [canchaService] Eliminando cancha ${id}`);
      // 🔥 CORREGIDO: Endpoint es /canchas (no /admin/canchas)
      const response = await apiBackend.delete(`/canchas/${id}`);
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
   * Obtener fotos de una cancha
   */
  async getFotosCancha(id: number): Promise<FotoCancha[]> {
    try {
      const response = await apiBackend.get(`/api/canchas/${id}/fotos`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener las fotos: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Agregar foto a una cancha
   */
  async addFotoCancha(id: number, fotoData: AddFotoInput): Promise<FotoCancha> {
    try {
      const response = await apiBackend.post(`/api/canchas/${id}/fotos`, fotoData);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al agregar la foto: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Eliminar foto de una cancha
   */
  async deleteFotoCancha(canchaId: number, mediaId: number): Promise<void> {
    try {
      const response = await apiBackend.delete(`/api/canchas/${canchaId}/fotos/${mediaId}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al eliminar la foto: ' + (error.response?.data?.message || error.message));
    }
  }
};

// Ejemplo de uso en un componente React:
// import { canchaService } from '../services/canchaService';
// useEffect(() => {
//   canchaService.getCanchas().then(data => setCanchas(data));
// }, []);
