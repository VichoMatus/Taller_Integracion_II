import api from "../config/backend";
import type { Pago, PagosList, PagoDetalle, PagoQueryParams } from '../types/pagos';

//export const pagosService = {
//  // Listar pagos del usuario con filtros
//  async getMisPagos(params?: PagoQueryParams): Promise<PagosList> {
//    const res = await api.get('/api/v1/pagos/mis', { params });
//    return res.data as PagosList;
//  },
//
//  // Obtener detalles de un pago
//  async getPagoDetalle(id_pago: number): Promise<PagoDetalle> {
//    const res = await api.get(`/api/v1/pagos/${id_pago}`);
//    return res.data as PagoDetalle;
//  },
//
//  // Crear un nuevo pago
//  async crearPago(data: Partial<Pago>): Promise<Pago> {
//    const res = await api.post('/api/v1/pagos', data);
//    return res.data as Pago;
// },
//
//  // Solicitar reembolso de un pago
//  async solicitarReembolso(id_pago: number, motivo: string): Promise<{ success: boolean; message?: string }> {
//    const res = await api.post(`/api/v1/pagos/${id_pago}/reembolso`, { motivo });
//    return res.data as { success: boolean; message?: string };
//  },
//
//  // Confirmar pago (si aplica)
//  async confirmarPago(id_pago: number): Promise<Pago> {
//    const res = await api.post(`/api/v1/pagos/${id_pago}/confirmar`);
//    return res.data as Pago;
//  }
//};



// Datos mock temporales para desarrollo Solo es una prueba para ver como se verian los datos de los pagos,
// mas adelante al implementarlos bien se borra todo lo que esta debajo de estoy de descomenta lo comentado que deberian
// de ser los services reales que consumen el backend

const mockPagos: Pago[] = [
  {
    id_pago: 1,
    id_reserva: 101,
    proveedor: "mercadopago",
    id_externo: "mp-123456789",
    moneda: "CLP",
    monto: 25000,
    estado: 'pagado',
    metadata: {
      metodo_pago: "credit_card",
      ultimos_digitos: "1234"
    },
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:35:00Z"
  },
  {
    id_pago: 2,
    id_reserva: 102,
    proveedor: "stripe",
    id_externo: "pi_123456789",
    moneda: "CLP",
    monto: 18000,
    estado: 'creado',
    metadata: {
      metodo_pago: "pending"
    },
    created_at: "2024-01-16T14:20:00Z",
    updated_at: "2024-01-16T14:20:00Z"
  },
  {
    id_pago: 3,
    id_reserva: 103,
    proveedor: "mercadopago",
    id_externo: "mp-987654321",
    moneda: "CLP",
    monto: 30000,
    estado: 'fallido',
    metadata: {
      metodo_pago: "debit_card",
      error: "fondos_insuficientes"
    },
    created_at: "2024-01-14T16:45:00Z",
    updated_at: "2024-01-14T16:47:00Z"
  },
  {
    id_pago: 4,
    id_reserva: 104,
    proveedor: "paypal",
    id_externo: "PAYID-123456789",
    moneda: "CLP",
    monto: 22000,
    estado: 'reembolsado',
    metadata: {
      metodo_pago: "paypal",
      motivo_reembolso: "cancelacion_usuario"
    },
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-01-12T11:30:00Z"
  }
];

export const pagosService = {
  // Listar pagos del usuario con filtros
  async getMisPagos(params?: PagoQueryParams): Promise<PagosList> {
    try {
      // Intenta conectar con el backend real
      const res = await api.get('/api/v1/pagos/mis', { params });
      return res.data as PagosList;
    } catch (error: any) {
      // Si falla, usa datos mock con filtros aplicados
      console.warn('Backend no disponible, usando datos mock para pagos', error);
      
      let filteredPagos = [...mockPagos];
      
      // Aplicar filtros a los datos mock
      if (params?.estado) {
        filteredPagos = filteredPagos.filter(pago => pago.estado === params.estado);
      }
      
      if (params?.proveedor) {
        filteredPagos = filteredPagos.filter(pago => pago.proveedor === params.proveedor);
      }
      
      const page = params?.page || 1;
      const pageSize = params?.page_size || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        items: filteredPagos.slice(startIndex, endIndex),
        total: filteredPagos.length,
        page,
        page_size: pageSize
      };
    }
  },

  // Obtener detalles de un pago
  async getPagoDetalle(id_pago: number): Promise<PagoDetalle> {
    try {
      const res = await api.get(`/api/v1/pagos/${id_pago}`);
      return res.data as PagoDetalle;
    } catch (error: any) {
      console.warn('Backend no disponible, usando datos mock para detalle de pago', error);
      
      const pago = mockPagos.find(p => p.id_pago === id_pago);
      if (!pago) {
        throw new Error(`Pago con ID ${id_pago} no encontrado`);
      }
      
      // Extender con datos adicionales para el detalle
      return {
        ...pago,
        reserva_inicio: "2024-01-20T10:00:00Z",
        reserva_fin: "2024-01-20T11:00:00Z",
        cancha_nombre: "Cancha de Fútbol 7 - Club Centro",
        usuario_nombre: "Usuario Demo"
      };
    }
  },

  // Crear un nuevo pago
  async crearPago(data: Partial<Pago>): Promise<Pago> {
    try {
      const res = await api.post('/api/v1/pagos', data);
      return res.data as Pago;
    } catch (error: any) {
      console.warn('Backend no disponible, simulando creación de pago', error);
      
      // Simular creación exitosa
      const nuevoPago: Pago = {
        id_pago: Math.max(...mockPagos.map(p => p.id_pago)) + 1,
        id_reserva: data.id_reserva || 0,
        proveedor: data.proveedor || 'mercadopago',
        id_externo: `mock-${Date.now()}`,
        moneda: data.moneda || 'CLP',
        monto: data.monto || 0,
        estado: 'creado',
        metadata: data.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return nuevoPago;
    }
  },

  // Solicitar reembolso de un pago
  async solicitarReembolso(id_pago: number, motivo: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await api.post(`/api/v1/pagos/${id_pago}/reembolso`, { motivo });
      return res.data as { success: boolean; message?: string };
    } catch (error: any) {
      console.warn('Backend no disponible, simulando reembolso', error);
      
      // Simular reembolso exitoso
      const pagoIndex = mockPagos.findIndex(p => p.id_pago === id_pago);
      if (pagoIndex !== -1) {
        mockPagos[pagoIndex].estado = 'reembolsado';
        mockPagos[pagoIndex].metadata.motivo_reembolso = motivo;
        mockPagos[pagoIndex].updated_at = new Date().toISOString();
      }
      
      return {
        success: true,
        message: 'Reembolso simulado exitosamente (modo desarrollo)'
      };
    }
  },

  // Confirmar pago (si aplica)
  async confirmarPago(id_pago: number): Promise<Pago> {
    try {
      const res = await api.post(`/api/v1/pagos/${id_pago}/confirmar`);
      return res.data as Pago;
    } catch (error: any) {
      console.warn('Backend no disponible, simulando confirmación de pago', error);
      
      const pagoIndex = mockPagos.findIndex(p => p.id_pago === id_pago);
      if (pagoIndex === -1) {
        throw new Error(`Pago con ID ${id_pago} no encontrado`);
      }
      
      mockPagos[pagoIndex].estado = 'pagado';
      mockPagos[pagoIndex].updated_at = new Date().toISOString();
      
      return mockPagos[pagoIndex];
    }
  }
};