import { AxiosInstance } from "axios";
import { ReservaRepository, ReservaFilters, CreateReservaInput, UpdateReservaInput, DisponibilidadInput, CotizacionInput } from "../domain/ReservaRepository";
import { Reserva, MetodoPago, CotizacionReserva } from "../../domain/reserva/Reserva";
import { toReserva, FastReserva } from "./mappers";
import { httpError } from "../../infra/http/errors";
import { Paginated, normalizePage } from "../../app/common/pagination";
import { toSnake } from "../../app/common/case";

/**
 * Implementación del repositorio de reservas utilizando FastAPI como backend.
 * Maneja la comunicación HTTP con el servicio de reservas y convierte entre formatos.
 */
export class ReservaApiRepository implements ReservaRepository {
  constructor(private http: AxiosInstance) {}

  /**
   * Lista reservas desde FastAPI con paginación y filtros.
   * Enriquece los datos con información de usuarios y canchas si no están incluidos.
   */
  async listReservas(filters: ReservaFilters): Promise<Paginated<Reserva>> {
    try {
      const params = toSnake({
        ...filters,
        fechaDesde: filters.fechaDesde?.toISOString(),
        fechaHasta: filters.fechaHasta?.toISOString(),
      });
      const { data } = await this.http.get(`/reservas`, { params });
      
      // 🔍 DEBUG: Ver qué envía FastAPI
      console.log('🔍 [listReservas] Respuesta de FastAPI:', JSON.stringify(data, null, 2));
      if (data?.items?.length > 0) {
        console.log('🔍 [listReservas] Primera reserva RAW:', JSON.stringify(data.items[0], null, 2));
      }
      
      // Enriquecer datos si FastAPI no incluye usuario/cancha
      const items = data.items || data;
      if (Array.isArray(items) && items.length > 0 && (!items[0].usuario || !items[0].cancha)) {
        console.log('⚠️ [listReservas] Enriqueciendo reservas con datos de usuarios y canchas...');
        await this.enrichReservas(items);
      }
      
      const result = normalizePage<Reserva>(data, x => toReserva(x as FastReserva));
      console.log('✅ [listReservas] Reservas procesadas:', result.items?.length || 0);
      return result;
    } catch (e) {
      console.error('❌ [listReservas] Error:', e);
      throw httpError(e);
    }
  }

  /**
   * Enriquece un array de reservas con datos de usuarios y canchas.
   * Obtiene todos los usuarios y canchas únicos de una vez para minimizar requests.
   */
  private async enrichReservas(reservas: FastReserva[]): Promise<void> {
    try {
      // Obtener IDs únicos de usuarios y canchas
      const usuarioIds = [...new Set(reservas.map(r => r.id_usuario || r.usuario_id).filter(Boolean))] as number[];
      const canchaIds = [...new Set(reservas.map(r => r.id_cancha || r.cancha_id).filter(Boolean))] as number[];
      
      console.log(`🔍 [enrichReservas] Obteniendo ${usuarioIds.length} usuarios y ${canchaIds.length} canchas`);
      
      // Hacer peticiones en paralelo
      const [usuariosData, canchasData] = await Promise.all([
        Promise.all(usuarioIds.map(id => 
          this.http.get(`/usuarios/${id}`)
            .then(res => ({ id, data: res.data }))
            .catch(err => { console.error(`Error obteniendo usuario ${id}:`, err.message); return null; })
        )),
        Promise.all(canchaIds.map(id => 
          this.http.get(`/canchas/${id}`)
            .then(res => ({ id, data: res.data }))
            .catch(err => { console.error(`Error obteniendo cancha ${id}:`, err.message); return null; })
        ))
      ]);
      
      // Crear mapas para búsqueda rápida
      const usuariosMap = new Map(
        usuariosData.filter(Boolean).map(u => [u!.id, {
          id: u!.data.id || u!.data.id_usuario,
          email: u!.data.email || u!.data.correo,
          nombre: u!.data.nombre,
          apellido: u!.data.apellido,
          telefono: u!.data.telefono
        }])
      );
      
      const canchasMap = new Map(
        canchasData.filter(Boolean).map(c => [c!.id, {
          id: c!.data.id || c!.data.id_cancha,
          nombre: c!.data.nombre,
          tipo: c!.data.tipo || c!.data.deporte,
          precio_por_hora: c!.data.precio_por_hora || c!.data.precio_base || 0
        }])
      );
      
      // Asignar datos a cada reserva
      for (const reserva of reservas) {
        const usuarioId = reserva.id_usuario || reserva.usuario_id;
        const canchaId = reserva.id_cancha || reserva.cancha_id;
        
        if (usuarioId && usuariosMap.has(usuarioId)) {
          reserva.usuario = usuariosMap.get(usuarioId);
        }
        
        if (canchaId && canchasMap.has(canchaId)) {
          reserva.cancha = canchasMap.get(canchaId);
        }
      }
      
      console.log(`✅ [enrichReservas] Datos enriquecidos - Usuarios: ${usuariosMap.size}, Canchas: ${canchasMap.size}`);
    } catch (e) {
      console.error('❌ [enrichReservas] Error:', e);
      // No lanzamos error para no romper la funcionalidad principal
    }
  }

  /**
   * Obtiene una reserva específica desde FastAPI.
   * Enriquece los datos con información de usuario y cancha si no están incluidos.
   */
  async getReserva(id: number): Promise<Reserva> {
    try {
      console.log(`🔍 [getReserva] Solicitando reserva ID: ${id}`);
      console.log(`🔍 [getReserva] URL completa: ${this.http.defaults.baseURL}/reservas/${id}`);
      const { data } = await this.http.get<FastReserva>(`/reservas/${id}`);
      console.log('📦 [getReserva] Respuesta FastAPI RAW:', JSON.stringify(data, null, 2));
      console.log('🔍 [getReserva] Valores importantes:', {
        id: data.id,
        id_reserva: data.id_reserva,
        precio_total: data.precio_total,
        estado: data.estado,
        pagado: data.pagado,
        hasUsuario: !!data.usuario,
        hasCancha: !!data.cancha,
        hasComplejo: !!data.complejo,
        allKeys: Object.keys(data)
      });
      
      // Si FastAPI no incluye usuario/cancha, hacer peticiones paralelas para obtenerlos
      if (!data.usuario || !data.cancha) {
        console.log('⚠️ [getReserva] FastAPI no incluyó usuario/cancha, enriqueciendo datos...');
        const enrichPromises = [];
        
        // Obtener usuario si falta
        if (!data.usuario && (data.id_usuario || data.usuario_id)) {
          const usuarioId = data.id_usuario || data.usuario_id;
          enrichPromises.push(
            this.http.get(`/usuarios/${usuarioId}`)
              .then(res => {
                console.log(`✅ [getReserva] Usuario ${usuarioId} obtenido`);
                data.usuario = {
                  id: res.data.id || res.data.id_usuario,
                  email: res.data.email || res.data.correo,
                  nombre: res.data.nombre,
                  apellido: res.data.apellido,
                  telefono: res.data.telefono
                };
              })
              .catch(err => console.error(`❌ [getReserva] Error obteniendo usuario ${usuarioId}:`, err.message))
          );
        }
        
        // Obtener cancha si falta
        if (!data.cancha && (data.id_cancha || data.cancha_id)) {
          const canchaId = data.id_cancha || data.cancha_id;
          enrichPromises.push(
            this.http.get(`/canchas/${canchaId}`)
              .then(res => {
                console.log(`✅ [getReserva] Cancha ${canchaId} obtenida`);
                data.cancha = {
                  id: res.data.id || res.data.id_cancha,
                  nombre: res.data.nombre,
                  tipo: res.data.tipo || res.data.deporte,
                  precio_por_hora: res.data.precio_por_hora || res.data.precio_base || 0
                };
              })
              .catch(err => console.error(`❌ [getReserva] Error obteniendo cancha ${canchaId}:`, err.message))
          );
        }
        
        await Promise.all(enrichPromises);
      }
      
      const reserva = toReserva(data);
      console.log('✅ [getReserva] Reserva mapeada:', {
        id: reserva.id,
        hasUsuario: !!reserva.usuario,
        hasCancha: !!reserva.cancha,
        precioTotal: reserva.precioTotal,
        usuarioNombre: reserva.usuario?.nombre,
        canchaNombre: reserva.cancha?.nombre
      });
      return reserva;
    } catch (e) {
      console.error('❌ [getReserva] Error:', e);
      throw httpError(e);
    }
  }

  /**
   * Crea una nueva reserva en FastAPI.
   */
  async createReserva(input: CreateReservaInput): Promise<Reserva> {
    try {
      const payload = toSnake({
        ...input,
        fechaInicio: input.fechaInicio.toISOString(),
        fechaFin: input.fechaFin.toISOString(),
      });
      const { data } = await this.http.post<FastReserva>(`/reservas`, payload);
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Actualiza una reserva en FastAPI.
   * ✅ FORMATO ACTUALIZADO: FastAPI espera { fecha, inicio, fin, notas }
   */
  async updateReserva(id: number, input: UpdateReservaInput): Promise<Reserva> {
    try {
      console.log(`🔍 [updateReserva] Actualizando reserva ${id}`);
      console.log(`🔍 [updateReserva] Input recibido:`, JSON.stringify(input, null, 2));
      
      // ⚠️ El input puede venir en dos formatos:
      // 1. Nuevo formato del frontend: { fecha: "2025-11-07", inicio: "10:00", fin: "11:00", notas: "..." }
      // 2. Formato legacy: { fechaInicio: Date, fechaFin: Date, notas: "..." }
      
      let payload: any;
      
      // Detectar si viene en formato nuevo (con campos fecha, inicio, fin)
      if ('fecha' in input && 'inicio' in input && 'fin' in input) {
        // Ya viene en formato correcto de FastAPI
        payload = {
          fecha: input.fecha,
          inicio: input.inicio,
          fin: input.fin,
          notas: input.notas || ''
        };
        console.log('✅ [updateReserva] Usando formato nuevo directo:', payload);
      } else if (input.fechaInicio && input.fechaFin) {
        // Formato legacy: convertir a formato FastAPI
        const fechaInicio = new Date(input.fechaInicio);
        const fechaFin = new Date(input.fechaFin);
        
        payload = {
          fecha: fechaInicio.toISOString().split('T')[0],
          inicio: fechaInicio.toTimeString().substring(0, 5),
          fin: fechaFin.toTimeString().substring(0, 5),
          notas: input.notas || ''
        };
        console.log('🔄 [updateReserva] Convertido de formato legacy:', payload);
      } else {
        console.error('❌ [updateReserva] Formato inválido. Input:', input);
        throw new Error('Formato de input inválido para actualizar reserva');
      }
      
      console.log(`📤 [updateReserva] Enviando PATCH a /reservas/${id}:`, payload);
      const { data } = await this.http.patch<FastReserva>(`/reservas/${id}`, payload);
      console.log('📦 [updateReserva] Respuesta de FastAPI:', JSON.stringify(data, null, 2));
      const reserva = toReserva(data);
      console.log('✅ [updateReserva] Reserva actualizada y mapeada exitosamente');
      return reserva;
    } catch (e) {
      console.error('❌ [updateReserva] Error:', e);
      throw httpError(e);
    }
  }

  /**
   * Elimina una reserva en FastAPI.
   */
  async deleteReserva(id: number): Promise<void> {
    try {
      await this.http.delete(`/reservas/${id}`);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Verifica disponibilidad de una cancha en FastAPI.
   * ⚠️ WORKAROUND: Si FastAPI no tiene el endpoint (404), asume disponible
   */
  async verificarDisponibilidad(input: DisponibilidadInput): Promise<boolean> {
    try {
      console.log('🔍 [verificarDisponibilidad] Verificando:', {
        canchaId: input.canchaId,
        fechaInicio: input.fechaInicio.toISOString(),
        fechaFin: input.fechaFin.toISOString(),
        reservaId: input.reservaId
      });
      
      const payload = {
        cancha_id: input.canchaId,
        fecha_inicio: input.fechaInicio.toISOString(),
        fecha_fin: input.fechaFin.toISOString(),
        ...(input.reservaId && { reserva_id: input.reservaId }),
      };
      
      const { data } = await this.http.post<{ disponible: boolean }>(`/reservas/verificar-disponibilidad`, payload);
      console.log('✅ [verificarDisponibilidad] Resultado:', data.disponible);
      return data.disponible;
    } catch (e: any) {
      // ⚠️ WORKAROUND: Si el endpoint no existe (404), asumir que está disponible
      // Esto permite que funcione la edición aunque FastAPI no tenga el endpoint
      if (e?.response?.status === 404 || e?.statusCode === 404) {
        console.log('⚠️ [verificarDisponibilidad] Endpoint no encontrado (404), asumiendo disponible');
        return true;
      }
      console.error('❌ [verificarDisponibilidad] Error:', e);
      throw httpError(e);
    }
  }

  /**
   * Obtiene reservas de un usuario específico desde FastAPI.
   */
  async getReservasByUsuario(usuarioId: number, incluirPasadas = false): Promise<Reserva[]> {
    try {
      const params = { incluir_pasadas: incluirPasadas };
      const { data } = await this.http.get<FastReserva[]>(`/reservas/usuario/${usuarioId}`, { params });
      return data.map(toReserva);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Confirma el pago de una reserva en FastAPI.
   * ✅ FORMATO ACTUALIZADO: FastAPI espera { metodo_pago: string }
   */
  async confirmarPago(id: number, metodoPago: MetodoPago): Promise<Reserva> {
    try {
      // FastAPI espera snake_case
      const payload = { metodo_pago: metodoPago };
      console.log(`✅ [confirmarPago] Confirmando reserva ${id} con método:`, payload);
      
      const { data } = await this.http.post<FastReserva>(`/reservas/${id}/confirmar`, payload);
      return toReserva(data);
    } catch (e) {
      console.error('❌ [confirmarPago] Error:', e);
      throw httpError(e);
    }
  }

  /**
   * Cancela una reserva en FastAPI.
   */
  async cancelarReserva(id: number, motivo?: string): Promise<Reserva> {
    try {
      const payload = motivo ? { motivo } : {};
      const { data } = await this.http.post<FastReserva>(`/reservas/${id}/cancelar`, payload);
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Cotiza el precio de una reserva en FastAPI.
   */
  async cotizarReserva(input: CotizacionInput): Promise<CotizacionReserva> {
    try {
      const payload = toSnake({
        ...input,
        canchaId: input.canchaId
      });
      const { data } = await this.http.post<any>(`/reservas/cotizar`, payload);
      return data; // Asumir que FastAPI retorna en formato correcto
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Marca asistencia del usuario a la reserva.
   */
  async checkInReserva(id: number): Promise<Reserva> {
    try {
      const { data } = await this.http.post<FastReserva>(`/reservas/${id}/check-in`, {});
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Marca inasistencia del usuario a la reserva.
   */
  async noShowReserva(id: number, observaciones?: string): Promise<Reserva> {
    try {
      const payload = observaciones ? { observaciones } : {};
      const { data } = await this.http.post<FastReserva>(`/reservas/${id}/no-show`, payload);
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  // ===== MÉTODOS ADMINISTRATIVOS =====

  /**
   * Crea una reserva con privilegios administrativos.
   * ✅ FORMATO CORREGIDO: Usa los nombres de campos que FastAPI espera
   */
  async createReservaAdmin(input: CreateReservaInput, targetUserId: number): Promise<Reserva> {
    try {
      // ✅ CONSTRUIR PAYLOAD CON FORMATO FASTAPI
      // FastAPI espera: id_cancha, fecha, inicio, fin, id_usuario
      const fechaInicio = new Date(input.fechaInicio);
      const fechaFin = new Date(input.fechaFin);
      
      // Extraer componentes de fecha y hora
      const fecha = fechaInicio.toISOString().split('T')[0]; // "2025-10-27"
      const inicio = fechaInicio.toTimeString().substring(0, 5); // "17:11"
      const fin = fechaFin.toTimeString().substring(0, 5); // "18:11"
      
      const payload = {
        id_cancha: input.canchaId,
        fecha: fecha,
        inicio: inicio,
        fin: fin,
        id_usuario: targetUserId,
        notas: input.notas || `Creada por administrador`
      };
      
      console.log('🔧 [ReservaApiRepository.createReservaAdmin] Payload FastAPI:', payload);
      
      const { data } = await this.http.post<FastReserva>(`/reservas`, payload, {
        headers: {
          'X-Admin-Create': 'true',
          'X-User-ID': targetUserId.toString()
        }
      });
      return toReserva(data);
    } catch (e) {
      console.error('❌ [ReservaApiRepository.createReservaAdmin] Error:', e);
      throw httpError(e);
    }
  }

  /**
   * Cancela una reserva con privilegios administrativos.
   */
  async cancelarReservaAdmin(id: number, motivoAdmin: string): Promise<Reserva> {
    try {
      const payload = { 
        motivo: motivoAdmin,
        admin_cancel: true 
      };
      const { data } = await this.http.post<FastReserva>(`/reservas/${id}/cancelar`, payload);
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene reservas de una cancha específica.
   */
  async getReservasByCancha(canchaId: number, filters: ReservaFilters = {}): Promise<Reserva[]> {
    try {
      const params = toSnake({
        ...filters,
        canchaId,
        fechaDesde: filters.fechaDesde?.toISOString(),
        fechaHasta: filters.fechaHasta?.toISOString(),
      });
      const { data } = await this.http.get(`/reservas`, { params });
      
      // Si es una respuesta paginada, tomar solo los items
      const items = data.items || data;
      return items.map((item: FastReserva) => toReserva(item));
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene reservas de un usuario específico (vista administrativa).
   */
  async getReservasByUsuarioAdmin(usuarioId: number, filters: ReservaFilters = {}): Promise<Reserva[]> {
    try {
      const params = toSnake({
        ...filters,
        usuarioId,
        fechaDesde: filters.fechaDesde?.toISOString(),
        fechaHasta: filters.fechaHasta?.toISOString(),
      });
      const { data } = await this.http.get(`/reservas`, { params });
      
      // Si es una respuesta paginada, tomar solo los items
      const items = data.items || data;
      return items.map((item: FastReserva) => toReserva(item));
    } catch (e) {
      throw httpError(e);
    }
  }
}
