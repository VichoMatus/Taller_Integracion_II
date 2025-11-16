import { AxiosInstance } from "axios";
import { AdminRepository } from "../domain/AdminRepository";
import { Complejo } from "../../domain/complejo/Complejo";
import { Cancha } from "../../domain/cancha/Cancha";
import { ReservaOwner, EstadisticasOwner, EstadisticasComplejo, ReservasPorDiaSemana, ReservasDia, ReservasPorCancha, ReservasCancha } from "../../domain/admin/Owner";
import { httpError } from "../../infra/http/errors";
import { Paginated, normalizePage } from "../../app/common/pagination";

/**
 * Implementación del repositorio para dueños de complejos deportivos utilizando FastAPI como backend.
 * Maneja la gestión de complejos, canchas, reservas y estadísticas para owners.
 */
export class AdminApiRepository implements AdminRepository {
  constructor(private http: AxiosInstance) {}

  // =============== PANEL DEL OWNER ===============

  /**
   * Obtiene los complejos del dueño usando endpoint existente.
   */
  async getMisComplejos(ownerId: number): Promise<Complejo[]> {
    try {
      // Usar endpoint existente /complejos con filtro de dueño
      const { data } = await this.http.get(`/complejos`, { 
        params: { duenio_id: ownerId } 
      });
      return data.items || data || [];
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene las canchas del dueño usando endpoint existente.
   */
  async getMisCanchas(ownerId: number): Promise<Cancha[]> {
    try {
      // Usar endpoint existente /canchas con filtro de dueño
      const { data } = await this.http.get(`/canchas`, { 
        params: { duenio_id: ownerId } 
      });
      return data.items || data || [];
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene las reservas del dueño usando endpoint existente.
   */
  async getMisReservas(ownerId: number, params: { fecha_desde?: string; fecha_hasta?: string; estado?: string } = {}): Promise<ReservaOwner[]> {
    try {
      // Usar endpoint existente /reservas con filtro de dueño
      const { data } = await this.http.get(`/reservas`, { 
        params: { duenio_id: ownerId, ...params } 
      });
      return data.items || data || [];
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene las estadísticas del dueño - simulando con datos de reservas.
   */
  async getMisEstadisticas(ownerId: number): Promise<EstadisticasOwner> {
    try {
      // Como no hay endpoint específico, calculamos básicas con reservas
      const reservas = await this.getMisReservas(ownerId);
      const complejos = await this.getMisComplejos(ownerId);
      const canchas = await this.getMisCanchas(ownerId);
      
      return {
        ingresos_totales: reservas.reduce((sum, r) => sum + (r.precio_total || 0), 0),
        ocupacion_promedio: reservas.length > 0 ? 75 : 0, // Placeholder
        reservas_mes: reservas.filter(r => r.estado === 'confirmada').length,
        canchas_activas: canchas.length
      };
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene estadísticas detalladas de un complejo específico.
   * Calcula métricas sobre canchas activas, reservas del último mes, ingresos, etc.
   */
  async getEstadisticasComplejo(ownerId: number, complejoId: number): Promise<EstadisticasComplejo> {
    try {
      // Obtener datos del complejo
      const complejo = await this.getComplejo(ownerId, complejoId);
      
      // Obtener todas las canchas del complejo con manejo robusto de respuesta
      const { data: canchasData } = await this.http.get(`/canchas`, { 
        params: { complejo_id: complejoId } 
      });
      
      // Extracción segura de canchas desde diferentes estructuras posibles
      let canchas: Cancha[] = [];
      if (Array.isArray(canchasData)) {
        canchas = canchasData;
      } else if (canchasData && typeof canchasData === 'object') {
        if (Array.isArray(canchasData.items)) {
          canchas = canchasData.items;
        } else if (Array.isArray(canchasData.data)) {
          canchas = canchasData.data;
        }
      }
      
      console.log(`✅ [AdminApiRepository.getEstadisticasComplejo] Canchas del complejo ${complejoId}:`, canchas.length);
      
      // Calcular fecha hace un mes
      const fechaHasta = new Date();
      const fechaDesde = new Date();
      fechaDesde.setDate(fechaDesde.getDate() - 30);
      
      // Obtener reservas del último mes para este complejo con manejo robusto
      const { data: reservasData } = await this.http.get(`/reservas`, { 
        params: { 
          complejo_id: complejoId,
          fecha_desde: fechaDesde.toISOString().split('T')[0],
          fecha_hasta: fechaHasta.toISOString().split('T')[0]
        } 
      });
      
      // Extracción segura de reservas desde diferentes estructuras posibles
      let reservas: ReservaOwner[] = [];
      if (Array.isArray(reservasData)) {
        reservas = reservasData;
      } else if (reservasData && typeof reservasData === 'object') {
        if (Array.isArray(reservasData.items)) {
          reservas = reservasData.items;
        } else if (Array.isArray(reservasData.data)) {
          reservas = reservasData.data;
        }
      }
      
      console.log(`✅ [AdminApiRepository.getEstadisticasComplejo] Reservas del complejo ${complejoId}:`, reservas.length);
      
      // Contar canchas activas e inactivas
      const canchasActivas = canchas.filter(c => c.activa !== false && c.estado !== 'inactiva').length;
      const canchasInactivas = canchas.length - canchasActivas;
      
      // Contar reservas por estado
      const reservasConfirmadas = reservas.filter(r => r.estado === 'confirmada').length;
      const reservasPendientes = reservas.filter(r => r.estado === 'pendiente').length;
      const reservasCanceladas = reservas.filter(r => r.estado === 'cancelada').length;
      
      // Calcular ingresos del último mes (solo reservas confirmadas)
      const ingresosUltimoMes = reservas
        .filter(r => r.estado === 'confirmada')
        .reduce((sum, r) => sum + (r.precio_total || 0), 0);
      
      // Calcular ocupación promedio (simplificado)
      // Asumimos que cada día tiene posibilidad de múltiples reservas por cancha
      const totalPosiblesReservas = canchasActivas * 30 * 8; // 8 slots promedio por día
      const ocupacionPromedio = totalPosiblesReservas > 0 
        ? Math.round((reservasConfirmadas / totalPosiblesReservas) * 100 * 100) / 100 
        : 0;
      
      return {
        complejo_id: complejoId,
        complejo_nombre: complejo.nombre || `Complejo ${complejoId}`,
        total_canchas: canchas.length,
        canchas_activas: canchasActivas,
        canchas_inactivas: canchasInactivas,
        reservas_ultimo_mes: reservas.length,
        reservas_confirmadas_ultimo_mes: reservasConfirmadas,
        reservas_pendientes_ultimo_mes: reservasPendientes,
        reservas_canceladas_ultimo_mes: reservasCanceladas,
        ingresos_ultimo_mes: ingresosUltimoMes,
        ocupacion_promedio: ocupacionPromedio,
        fecha_desde: fechaDesde.toISOString().split('T')[0],
        fecha_hasta: fechaHasta.toISOString().split('T')[0]
      };
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene estadísticas de reservas agrupadas por día de la semana.
   * Genera datos para gráfico de barras con eje X = días de la semana, eje Y = cantidad de reservas.
   */
  async getReservasPorDiaSemana(ownerId: number, complejoId: number, diasAtras: number = 30): Promise<ReservasPorDiaSemana> {
    try {
      // Obtener datos del complejo
      const complejo = await this.getComplejo(ownerId, complejoId);
      
      // Calcular rango de fechas
      const fechaHasta = new Date();
      const fechaDesde = new Date();
      fechaDesde.setDate(fechaDesde.getDate() - diasAtras);
      
      // Obtener reservas del período para este complejo con manejo robusto
      const { data: reservasData } = await this.http.get(`/reservas`, { 
        params: { 
          complejo_id: complejoId,
          fecha_desde: fechaDesde.toISOString().split('T')[0],
          fecha_hasta: fechaHasta.toISOString().split('T')[0]
        } 
      });
      
      // Extracción segura de reservas desde diferentes estructuras posibles
      let reservas: ReservaOwner[] = [];
      if (Array.isArray(reservasData)) {
        reservas = reservasData;
      } else if (reservasData && typeof reservasData === 'object') {
        if (Array.isArray(reservasData.items)) {
          reservas = reservasData.items;
        } else if (Array.isArray(reservasData.data)) {
          reservas = reservasData.data;
        }
      }
      
      console.log(`✅ [AdminApiRepository.getReservasPorDiaSemana] Reservas del complejo ${complejoId}:`, reservas.length);
      
      // Nombres de los días en español
      const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      
      // Inicializar contadores para cada día de la semana
      const datosPorDia: Map<number, ReservasDia> = new Map();
      for (let i = 0; i < 7; i++) {
        datosPorDia.set(i, {
          dia_numero: i,
          dia_nombre: nombresDias[i],
          total_reservas: 0,
          reservas_confirmadas: 0,
          reservas_pendientes: 0,
          reservas_canceladas: 0,
          ingresos: 0
        });
      }
      
      // Agrupar reservas por día de la semana con validación de datos
      reservas.forEach(reserva => {
        // Validar que la reserva tenga fecha
        if (!reserva || !reserva.fecha) {
          console.warn('⚠️ [AdminApiRepository.getReservasPorDiaSemana] Reserva sin fecha, omitiendo:', reserva);
          return;
        }
        
        const fechaReserva = new Date(reserva.fecha);
        
        // Validar que la fecha sea válida
        if (isNaN(fechaReserva.getTime())) {
          console.warn('⚠️ [AdminApiRepository.getReservasPorDiaSemana] Fecha inválida, omitiendo:', reserva.fecha);
          return;
        }
        
        const diaSemana = fechaReserva.getDay(); // 0=Domingo, 1=Lunes, etc.
        
        const datoDia = datosPorDia.get(diaSemana)!;
        datoDia.total_reservas++;
        
        switch (reserva.estado) {
          case 'confirmada':
            datoDia.reservas_confirmadas++;
            // Usar || 0 para manejar null/undefined de manera segura
            datoDia.ingresos += (reserva.precio_total ?? 0);
            break;
          case 'pendiente':
            datoDia.reservas_pendientes++;
            break;
          case 'cancelada':
            datoDia.reservas_canceladas++;
            break;
        }
      });
      
      // Convertir Map a Array ordenado (Lunes a Domingo para mejor visualización)
      const diasOrdenados: ReservasDia[] = [
        datosPorDia.get(1)!, // Lunes
        datosPorDia.get(2)!, // Martes
        datosPorDia.get(3)!, // Miércoles
        datosPorDia.get(4)!, // Jueves
        datosPorDia.get(5)!, // Viernes
        datosPorDia.get(6)!, // Sábado
        datosPorDia.get(0)!, // Domingo
      ];
      
      // Encontrar día más y menos popular
      let maxReservas = 0;
      let minReservas = Infinity;
      let diaMasPopular = '';
      let diaMenosPopular = '';
      
      diasOrdenados.forEach(dia => {
        if (dia.total_reservas > maxReservas) {
          maxReservas = dia.total_reservas;
          diaMasPopular = dia.dia_nombre;
        }
        if (dia.total_reservas < minReservas) {
          minReservas = dia.total_reservas;
          diaMenosPopular = dia.dia_nombre;
        }
      });
      
      return {
        complejo_id: complejoId,
        complejo_nombre: complejo.nombre || `Complejo ${complejoId}`,
        dias: diasOrdenados,
        fecha_desde: fechaDesde.toISOString().split('T')[0],
        fecha_hasta: fechaHasta.toISOString().split('T')[0],
        total_reservas: reservas.length,
        dia_mas_popular: diaMasPopular,
        dia_menos_popular: diaMenosPopular
      };
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene estadísticas de reservas agrupadas por cancha.
   * Genera datos para gráfico de barras con eje X = canchas, eje Y = cantidad de reservas.
   */
  async getReservasPorCancha(ownerId: number, complejoId: number, diasAtras: number = 30): Promise<ReservasPorCancha> {
    try {
      // Obtener datos del complejo
      const complejo = await this.getComplejo(ownerId, complejoId);
      
      // Obtener todas las canchas del complejo con manejo robusto
      const { data: canchasData } = await this.http.get(`/canchas`, { 
        params: { complejo_id: complejoId } 
      });
      
      // Extracción segura de canchas desde diferentes estructuras posibles
      let canchas: Cancha[] = [];
      if (Array.isArray(canchasData)) {
        canchas = canchasData;
      } else if (canchasData && typeof canchasData === 'object') {
        if (Array.isArray(canchasData.items)) {
          canchas = canchasData.items;
        } else if (Array.isArray(canchasData.data)) {
          canchas = canchasData.data;
        }
      }
      
      console.log(`✅ [AdminApiRepository.getReservasPorCancha] Canchas del complejo ${complejoId}:`, canchas.length);
      
      // Calcular rango de fechas
      const fechaHasta = new Date();
      const fechaDesde = new Date();
      fechaDesde.setDate(fechaDesde.getDate() - diasAtras);
      
      // Obtener reservas del período para este complejo con manejo robusto
      const { data: reservasData } = await this.http.get(`/reservas`, { 
        params: { 
          complejo_id: complejoId,
          fecha_desde: fechaDesde.toISOString().split('T')[0],
          fecha_hasta: fechaHasta.toISOString().split('T')[0]
        } 
      });
      
      // Extracción segura de reservas desde diferentes estructuras posibles
      let reservas: ReservaOwner[] = [];
      if (Array.isArray(reservasData)) {
        reservas = reservasData;
      } else if (reservasData && typeof reservasData === 'object') {
        if (Array.isArray(reservasData.items)) {
          reservas = reservasData.items;
        } else if (Array.isArray(reservasData.data)) {
          reservas = reservasData.data;
        }
      }
      
      console.log(`✅ [AdminApiRepository.getReservasPorCancha] Reservas del complejo ${complejoId}:`, reservas.length);
      
      // Inicializar contadores para cada cancha
      const datosPorCancha: Map<number, ReservasCancha> = new Map();
      
      canchas.forEach(cancha => {
        datosPorCancha.set(cancha.id, {
          cancha_id: cancha.id,
          cancha_nombre: cancha.nombre,
          tipo_cancha: cancha.tipo || 'N/A',
          total_reservas: 0,
          reservas_confirmadas: 0,
          reservas_pendientes: 0,
          reservas_canceladas: 0,
          ingresos: 0,
          ocupacion_porcentaje: 0
        });
      });
      
      // Agrupar reservas por cancha con validación robusta
      reservas.forEach(reserva => {
        // Validar que la reserva tenga cancha_id
        if (!reserva || typeof reserva.cancha_id !== 'number') {
          console.warn('⚠️ [AdminApiRepository.getReservasPorCancha] Reserva sin cancha_id válido, omitiendo:', reserva);
          return;
        }
        
        const datoCancha = datosPorCancha.get(reserva.cancha_id);
        
        if (datoCancha) {
          datoCancha.total_reservas++;
          
          switch (reserva.estado) {
            case 'confirmada':
              datoCancha.reservas_confirmadas++;
              // Usar ?? 0 para manejar null/undefined de manera segura
              datoCancha.ingresos += (reserva.precio_total ?? 0);
              break;
            case 'pendiente':
              datoCancha.reservas_pendientes++;
              break;
            case 'cancelada':
              datoCancha.reservas_canceladas++;
              break;
          }
        } else {
          console.warn(`⚠️ [AdminApiRepository.getReservasPorCancha] Reserva para cancha_id ${reserva.cancha_id} no encontrada en las canchas del complejo`);
        }
      });
      
      // Calcular ocupación para cada cancha
      const totalPosiblesReservasPorCancha = diasAtras * 8; // 8 slots por día
      datosPorCancha.forEach(datoCancha => {
        if (totalPosiblesReservasPorCancha > 0) {
          datoCancha.ocupacion_porcentaje = Math.round(
            (datoCancha.reservas_confirmadas / totalPosiblesReservasPorCancha) * 100 * 100
          ) / 100;
        }
      });
      
      // Convertir Map a Array y ordenar por total de reservas (descendente)
      const canchasArray = Array.from(datosPorCancha.values())
        .sort((a, b) => b.total_reservas - a.total_reservas);
      
      // Encontrar cancha más y menos popular (que tengan reservas)
      const canchasConReservas = canchasArray.filter(c => c.total_reservas > 0);
      let canchaMasPopular = 'N/A';
      let canchaMenosPopular = 'N/A';
      
      if (canchasConReservas.length > 0) {
        canchaMasPopular = canchasConReservas[0].cancha_nombre;
        canchaMenosPopular = canchasConReservas[canchasConReservas.length - 1].cancha_nombre;
      }
      
      // Calcular totales
      const totalReservas = canchasArray.reduce((sum, c) => sum + c.total_reservas, 0);
      const ingresosTotales = canchasArray.reduce((sum, c) => sum + c.ingresos, 0);
      
      return {
        complejo_id: complejoId,
        complejo_nombre: complejo.nombre || `Complejo ${complejoId}`,
        canchas: canchasArray,
        fecha_desde: fechaDesde.toISOString().split('T')[0],
        fecha_hasta: fechaHasta.toISOString().split('T')[0],
        total_reservas: totalReservas,
        cancha_mas_popular: canchaMasPopular,
        cancha_menos_popular: canchaMenosPopular,
        ingresos_totales: ingresosTotales
      };
    } catch (e) { throw httpError(e); }
  }

  // =============== GESTIÓN DE COMPLEJOS ===============

  /**
   * Crea un nuevo complejo usando endpoint existente.
   */
  async createComplejo(ownerId: number, complejo: Omit<Complejo, 'id'>): Promise<Complejo> {
    try {
      const { data } = await this.http.post(`/complejos`, {
        ...complejo,
        duenio_id: ownerId
      });
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene un complejo específico usando endpoint existente.
   */
  async getComplejo(ownerId: number, complejoId: number): Promise<Complejo> {
    try {
      const { data } = await this.http.get(`/complejos/${complejoId}`);
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Actualiza un complejo usando endpoint existente.
   */
  async updateComplejo(ownerId: number, complejoId: number, updates: Partial<Complejo>): Promise<Complejo> {
    try {
      const { data } = await this.http.put(`/complejos/${complejoId}`, updates);
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Elimina un complejo usando endpoint existente.
   */
  async deleteComplejo(ownerId: number, complejoId: number): Promise<void> {
    try {
      await this.http.delete(`/complejos/${complejoId}`);
    } catch (e) { throw httpError(e); }
  }

  // =============== GESTIÓN DE CANCHAS ===============

  /**
   * Crea una nueva cancha usando endpoint existente.
   */
  async createCancha(ownerId: number, cancha: Omit<Cancha, 'id'>): Promise<Cancha> {
    try {
      const { data } = await this.http.post(`/canchas`, {
        ...cancha,
        duenio_id: ownerId
      });
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene una cancha específica usando endpoint existente.
   */
  async getCancha(ownerId: number, canchaId: number): Promise<Cancha> {
    try {
      const { data } = await this.http.get(`/canchas/${canchaId}`);
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Actualiza una cancha usando endpoint existente.
   */
  async updateCancha(ownerId: number, canchaId: number, updates: Partial<Cancha>): Promise<Cancha> {
    try {
      const { data } = await this.http.put(`/canchas/${canchaId}`, updates);
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Elimina una cancha usando endpoint existente.
   */
  async deleteCancha(ownerId: number, canchaId: number): Promise<void> {
    try {
      await this.http.delete(`/canchas/${canchaId}`);
    } catch (e) { throw httpError(e); }
  }
}
