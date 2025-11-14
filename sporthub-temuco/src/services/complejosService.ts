import { apiBackend } from '../config/backend';
import {
  ComplejoFilters,
  CreateComplejoInput,
  UpdateComplejoInput,
  HorarioComplejo,
  ResumenComplejo
} from '../types/complejos';

export const complejosService = {
  /**
   * Obtener todos los complejos (con filtros opcionales)
   */
  async getComplejos(filters?: ComplejoFilters) {
    try {
      const response = await apiBackend.get('/complejos', { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener complejos: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener un complejo por ID
   */
  async getComplejoById(id: number) {
    try {
      const response = await apiBackend.get(`/complejos/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener el complejo: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Crear un nuevo complejo
   */
  async createComplejo(input: CreateComplejoInput) {
    try {
      const response = await apiBackend.post('/complejos', input);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al crear el complejo: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Actualizar un complejo existente
   */
  async updateComplejo(id: number, input: UpdateComplejoInput) {
    try {
      const response = await apiBackend.patch(`/complejos/${id}`, input);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al actualizar el complejo: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Eliminar un complejo
   */
  async deleteComplejo(id: number) {
    try {
      const response = await apiBackend.delete(`/complejos/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al eliminar el complejo: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener canchas del admin logueado (todas sus canchas del complejo)
   */
  async getCanchasDeComplejo(idComplejo: number) {
    try {
      // Usar el endpoint de canchas del admin que devuelve todas las canchas del complejo del admin
      const response = await apiBackend.get('/canchas/admin', {
        params: {
          page: 1,
          page_size: 100 // Obtener todas las canchas (max 100)
        }
      });
      console.log('🏟️ [getCanchasDeComplejo] Respuesta del backend:', response.data);
      
      // El backend devuelve { ok: true, data: { items: [...], total: X, page: 1, page_size: 20 } }
      const data = response.data.data || response.data;
      const canchas = data.items || data;
      
      console.log('🏟️ [getCanchasDeComplejo] Canchas obtenidas:', canchas?.length || 0);
      console.log('🏟️ [getCanchasDeComplejo] Total en BD:', data.total);
      
      return canchas;
    } catch (error: any) {
      console.error('❌ [getCanchasDeComplejo] Error:', error);
      throw new Error('Error al obtener canchas del admin: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener horarios de atención de un complejo
   */
  async getHorariosDeComplejo(idComplejo: number): Promise<HorarioComplejo[]> {
    try {
      const response = await apiBackend.get(`/complejos/${idComplejo}/horarios`);
      return response.data as HorarioComplejo[];
    } catch (error: any) {
      throw new Error('Error al obtener horarios del complejo: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener bloqueos y cierres de un complejo
   */
  async getBloqueosDeComplejo(idComplejo: number) {
    try {
      const response = await apiBackend.get(`/complejos/${idComplejo}/bloqueos`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener bloqueos del complejo: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener resumen (KPIs) del complejo
   */
  async getResumenDeComplejo(idComplejo: number): Promise<ResumenComplejo> {
    try {
      const response = await apiBackend.get(`/complejos/${idComplejo}/resumen`);
      return response.data as ResumenComplejo;
    } catch (error: any) {
      throw new Error('Error al obtener resumen del complejo: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener complejos de un administrador específico
   * Usa el endpoint GET /complejos/admin/:adminId que llama a FastAPI /complejos/duenio/{duenio-id}
   * @param adminId - ID del administrador/dueño
   */
  async getComplejosByAdmin(adminId: number) {
    try {
      console.log(`📍 [complejosService] Obteniendo complejos del admin ID: ${adminId}`);
      console.log(`📍 [complejosService] ℹ️ Usando endpoint /complejos/admin/${adminId}`);
      console.log(`📍 [complejosService] URL base: ${apiBackend.defaults.baseURL || 'No definida'}`);
      
      // ✅ ENDPOINT CORRECTO: /complejos/admin/:adminId
      // Este endpoint está en complejos.routes.ts línea 55
      // Llama a FastAPI: GET /api/v1/complejos/duenio/{duenio-id}
      const response = await apiBackend.get(`/complejos/admin/${adminId}`);
      
      console.log(`✅ [complejosService] Complejos obtenidos exitosamente`);
      console.log(`📦 [complejosService] Respuesta:`, response.data);
      
      // El interceptor ya extrajo los datos de { ok, data }
      const data = response.data;
      
      // Si ya es un array, devolverlo directamente
      if (Array.isArray(data)) {
        console.log(`📋 [complejosService] Encontrados ${data.length} complejos del admin`);
        return data;
      }
      
      // Si viene como { items: [...] }, extraer el array
      if (data?.items) {
        console.log(`📋 [complejosService] Encontrados ${data.items.length} complejos en data.items`);
        return data.items;
      }
      
      // Si no, devolver vacío
      console.warn('⚠️ [complejosService] No se encontraron complejos en la respuesta');
      return [];
    } catch (error: any) {
      console.error(`❌ [complejosService] Error al obtener complejos del admin:`, error);
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Message: ${error.message}`);
      console.error(`   Response data:`, error.response?.data);
      
      throw new Error('Error al cargar tus complejos: ' + (error.response?.data?.message || error.message));
    }
  }
};
