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
   * Obtener canchas de un complejo
   */
  async getCanchasDeComplejo(idComplejo: number) {
    try {
      const response = await apiBackend.get(`/complejos/${idComplejo}/canchas`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener canchas del complejo: ' + (error.response?.data?.message || error.message));
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
   * Obtener complejos de un administrador/dueño específico
   * @param adminId - ID del administrador/dueño
   */
  async getComplejosByAdmin(adminId: number) {
    try {
      console.log(`📍 [complejosService] Obteniendo complejos del admin ID: ${adminId}`);
      
      // 🔥 ENDPOINT CORREGIDO: Usar /complejos con query param duenioId
      // Este endpoint público está en complejos.routes.ts línea 45
      // El controller acepta duenioId como query parameter (línea 41)
      const response = await apiBackend.get(`/complejos`, {
        params: { duenioId: adminId }
      });
      console.log(`✅ [complejosService] Complejos obtenidos:`, response.data);
      
      // El interceptor ya extrajo los datos de { ok, data }
      // El endpoint retorna { items: [...], total: ... }
      const data = response.data;
      
      // Si viene como { items: [...] }, extraer el array
      if (data?.items) {
        return data.items;
      }
      
      // Si ya es un array, devolverlo directamente
      if (Array.isArray(data)) {
        return data;
      }
      
      // Si no, devolver vacío
      return [];
    } catch (error: any) {
      console.error(`❌ [complejosService] Error al obtener complejos del admin:`, error);
      throw new Error('Error al obtener complejos del administrador: ' + (error.response?.data?.message || error.message));
    }
  }
};
