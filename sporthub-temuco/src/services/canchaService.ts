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
      totalResenas: backendCancha.total_reviews,
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
 * SCHEMAS REALES según OpenAPI de FastAPI:
 * 
 * CREATE (CanchaCreateIn):
 *   - id_complejo (required)
 *   - nombre (required)
 *   - deporte (optional) - nombre del deporte
 *   - cubierta (optional, default: false)
 * 
 * UPDATE (CanchaUpdateIn):
 *   - nombre (optional)
 *   - deporte (optional)
 *   - cubierta (optional)
 *   - activo (optional)
 * 
 * IMPORTANTE: precio_desde, capacidad NO existen en CREATE/UPDATE
 * Son campos de solo lectura que retorna el GET
 */
const adaptCanchaToBackend = (frontendCancha: CreateCanchaInput | UpdateCanchaInput, isUpdate: boolean = false) => {
  const payload: any = {};

  // Campos comunes a CREATE y UPDATE
  if (frontendCancha.nombre !== undefined) {
    payload.nombre = frontendCancha.nombre;
  }

  if ((frontendCancha as any).tipo !== undefined) {
    payload.deporte = (frontendCancha as any).tipo;
  }

  if ((frontendCancha as any).techada !== undefined) {
    payload.cubierta = (frontendCancha as any).techada;
  }

  // Campo SOLO para CREATE
  if (!isUpdate && (frontendCancha as any).establecimientoId !== undefined) {
    payload.id_complejo = (frontendCancha as any).establecimientoId;
  }

  // Campo SOLO para UPDATE
  if (isUpdate && (frontendCancha as any).activa !== undefined) {
    payload.activo = (frontendCancha as any).activa;
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
      // Verificar estado de autenticación antes de enviar
      const token = typeof window !== 'undefined' ? (localStorage.getItem('access_token') || localStorage.getItem('token')) : null;
      console.log('🔐 [canchaService] Estado de autenticación:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 30)}...` : 'No token'
      });
      
      const backendData = adaptCanchaToBackend(input, false); // false = CREATE
      console.log('📤 [canchaService] Enviando datos para crear cancha:', backendData);
      // Usar endpoint /admin/canchas que tiene control de permisos para dueno/admin/superadmin
      const response = await apiBackend.post('/admin/canchas', backendData);
      
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
        responseData: error.response?.data,
        responseDataFull: JSON.stringify(error.response?.data, null, 2),
        status: error.response?.status,
        statusText: error.response?.statusText
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
      // Usar endpoint /admin/canchas que tiene control de permisos
      const response = await apiBackend.patch(`/admin/canchas/${id}`, backendData);
      
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
      // Usar endpoint /admin/canchas que tiene control de permisos
      const response = await apiBackend.delete(`/admin/canchas/${id}`);
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
