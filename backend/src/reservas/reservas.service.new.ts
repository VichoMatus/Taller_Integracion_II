import axios, { AxiosInstance } from 'axios';

/**
 * Servicio para comunicarse con el backend FastAPI de reservas
 * Este servicio actúa como cliente HTTP para el backend real
 */
export class ReservaServiceNew {
  private apiClient: AxiosInstance;
  private fastApiUrl: string;

  constructor() {
    // URL del backend FastAPI - usa la misma configuración que el resto del BFF
    this.fastApiUrl = process.env.API_BASE_URL || process.env.FASTAPI_URL || 'http://api-h1d7oi-a881cc-168-232-167-73.traefik.me';
    
    // Remover trailing slash si existe
    if (this.fastApiUrl.endsWith('/')) {
      this.fastApiUrl = this.fastApiUrl.slice(0, -1);
    }
    
    // Cliente axios configurado
    this.apiClient = axios.create({
      baseURL: this.fastApiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🔧 [ReservaServiceNew] Inicializado con URL:', this.fastApiUrl);
  }

  /**
   * Obtiene todas las reservas del usuario autenticado
   * Endpoint: GET /api/v1/reservas/mias
   * 
   * @param token - JWT token del usuario autenticado
   * @returns Array de reservas del usuario
   */
  async getMisReservas(token: string): Promise<any[]> {
    try {
      console.log('🔍 [ReservaServiceNew] Obteniendo reservas del usuario');

      const response = await this.apiClient.get('/api/v1/reservas/mias', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ [ReservaServiceNew] Reservas obtenidas:', response.data.length || 0);
      
      // La API retorna un array directamente
      return Array.isArray(response.data) ? response.data : [];
      
    } catch (error: any) {
      console.error('❌ [ReservaServiceNew] Error al obtener reservas:', error.message);
      
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      
      throw new Error(error.response?.data?.detail || 'Error al obtener las reservas');
    }
  }

  /**
   * Crea una nueva reserva
   * Endpoint: POST /api/v1/reservas
   * 
   * Request Body:
   * {
   *   "fecha": "2025-10-21",
   *   "fin": "20:30",
   *   "id_cancha": 1,
   *   "inicio": "19:00",
   *   "notas": "Partido amistoso"
   * }
   * 
   * @param token - JWT token del usuario autenticado
   * @param reservaData - Datos de la reserva a crear
   * @returns Reserva creada
   */
  async crearReserva(token: string, reservaData: {
    fecha: string;      // Formato: "YYYY-MM-DD"
    inicio: string;     // Formato: "HH:MM"
    fin: string;        // Formato: "HH:MM"
    id_cancha: number;
    notas?: string;
  }): Promise<any> {
    try {
      console.log('📤 [ReservaServiceNew] Creando reserva:', reservaData);

      const response = await this.apiClient.post(
        '/api/v1/reservas',
        reservaData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ [ReservaServiceNew] Reserva creada exitosamente:', response.data);
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ [ReservaServiceNew] Error al crear reserva:', error.message);
      
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
        
        // Manejar errores específicos de la API
        if (error.response.status === 400) {
          throw new Error('Validación fallida: ' + (error.response.data?.detail || 'Datos inválidos'));
        } else if (error.response.status === 401) {
          throw new Error('No autenticado: Token inválido o expirado');
        } else if (error.response.status === 422) {
          throw new Error('Error de validación: ' + JSON.stringify(error.response.data?.detail || 'Datos incorrectos'));
        }
      }
      
      throw new Error(error.response?.data?.detail || 'Error al crear la reserva');
    }
  }

  /**
   * Obtiene una reserva por ID
   * Endpoint: GET /api/v1/reservas/{id_reserva}
   */
  async getReservaById(token: string, idReserva: number): Promise<any> {
    try {
      console.log(`🔍 [ReservaServiceNew] Obteniendo reserva ID: ${idReserva}`);

      const response = await this.apiClient.get(`/api/v1/reservas/${idReserva}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ [ReservaServiceNew] Reserva obtenida:', response.data);
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ [ReservaServiceNew] Error al obtener reserva:', error.message);
      throw new Error(error.response?.data?.detail || 'Error al obtener la reserva');
    }
  }

  /**
   * Cancela una reserva
   * Endpoint: DELETE /api/v1/reservas/{id_reserva}
   */
  async cancelarReserva(token: string, idReserva: number): Promise<void> {
    try {
      console.log(`🗑️ [ReservaServiceNew] Cancelando reserva ID: ${idReserva}`);

      await this.apiClient.delete(`/api/v1/reservas/${idReserva}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ [ReservaServiceNew] Reserva cancelada exitosamente');
      
    } catch (error: any) {
      console.error('❌ [ReservaServiceNew] Error al cancelar reserva:', error.message);
      throw new Error(error.response?.data?.detail || 'Error al cancelar la reserva');
    }
  }
}

// Exportar instancia única (Singleton)
export const reservaServiceNew = new ReservaServiceNew();
