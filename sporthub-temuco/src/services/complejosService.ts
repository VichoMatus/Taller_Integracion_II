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
      const response = await apiBackend.post('/api/complejos', input);
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
      const response = await apiBackend.patch(`/api/complejos/${id}`, input);
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
      const response = await apiBackend.delete(`/api/complejos/${id}`);
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
      const response = await apiBackend.get(`/api/complejos/${idComplejo}/canchas`);
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
      const response = await apiBackend.get(`/api/complejos/${idComplejo}/horarios`);
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
      const response = await apiBackend.get(`/api/complejos/${idComplejo}/bloqueos`);
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
      const response = await apiBackend.get(`/api/complejos/${idComplejo}/resumen`);
      return response.data as ResumenComplejo;
    } catch (error: any) {
      throw new Error('Error al obtener resumen del complejo: ' + (error.response?.data?.message || error.message));
    }
  }
};
