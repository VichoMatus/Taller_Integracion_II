import { AxiosInstance } from 'axios';
import { DisponibilidadRepository } from '../domain/repository';
import { 
  Horario, 
  Bloqueo, 
  DisponibilidadSlot, 
  DisponibilidadConsulta,
  CreateHorarioInput,
  UpdateHorarioInput,
  CreateBloqueoInput
} from '../domain/entities';

/**
 * Implementación del repositorio de disponibilidad usando API externa
 */
export class DisponibilidadApiRepository implements DisponibilidadRepository {
  constructor(private http: AxiosInstance) {}

  // Disponibilidad
  async getDisponibilidad(consulta: DisponibilidadConsulta): Promise<DisponibilidadSlot[]> {
    try {
      const params = new URLSearchParams();
      
      if (consulta.id_complejo) params.append('id_complejo', consulta.id_complejo.toString());
      if (consulta.id_cancha) params.append('id_cancha', consulta.id_cancha.toString());
      params.append('fecha_inicio', consulta.fecha_inicio);
      params.append('fecha_fin', consulta.fecha_fin);
      if (consulta.solo_disponibles !== undefined) {
        params.append('solo_disponibles', consulta.solo_disponibles.toString());
      }

      const { data } = await this.http.get<DisponibilidadSlot[]>(
        `/disponibilidad?${params.toString()}`
      );
      
      return data;
    } catch (error: any) {
      throw new Error(`Error al obtener disponibilidad: ${error.message}`);
    }
  }

  // Horarios
  async getHorarios(idComplejo: number, idCancha?: number): Promise<Horario[]> {
    try {
      const params = new URLSearchParams();
      params.append('id_complejo', idComplejo.toString());
      if (idCancha) params.append('id_cancha', idCancha.toString());

      const { data } = await this.http.get<Horario[]>(
        `/horarios?${params.toString()}`
      );
      
      return data;
    } catch (error: any) {
      throw new Error(`Error al obtener horarios: ${error.message}`);
    }
  }

  async getHorario(idHorario: number): Promise<Horario | null> {
    try {
      const { data } = await this.http.get<Horario>(`/horarios/${idHorario}`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Error al obtener horario: ${error.message}`);
    }
  }

  async createHorario(data: CreateHorarioInput): Promise<Horario> {
    try {
      const payload = {
        id_complejo: data.id_complejo,
        id_cancha: data.id_cancha || null,
        dia_semana: data.dia_semana,
        hora_apertura: data.hora_apertura,
        hora_cierre: data.hora_cierre
      };

      const { data: horario } = await this.http.post<Horario>('/horarios', payload);
      return horario;
    } catch (error: any) {
      throw new Error(`Error al crear horario: ${error.message}`);
    }
  }

  async updateHorario(idHorario: number, data: UpdateHorarioInput): Promise<Horario> {
    try {
      const payload: any = {};
      
      if (data.dia_semana !== undefined) payload.dia_semana = data.dia_semana;
      if (data.hora_apertura !== undefined) payload.hora_apertura = data.hora_apertura;
      if (data.hora_cierre !== undefined) payload.hora_cierre = data.hora_cierre;
      if (data.activo !== undefined) payload.activo = data.activo;

      const { data: horario } = await this.http.patch<Horario>(`/horarios/${idHorario}`, payload);
      return horario;
    } catch (error: any) {
      throw new Error(`Error al actualizar horario: ${error.message}`);
    }
  }

  async deleteHorario(idHorario: number): Promise<boolean> {
    try {
      await this.http.delete(`/horarios/${idHorario}`);
      return true;
    } catch (error: any) {
      throw new Error(`Error al eliminar horario: ${error.message}`);
    }
  }

  // Bloqueos
  async getBloqueos(idComplejo: number, idCancha?: number): Promise<Bloqueo[]> {
    try {
      const params = new URLSearchParams();
      params.append('id_complejo', idComplejo.toString());
      if (idCancha) params.append('id_cancha', idCancha.toString());

      const { data } = await this.http.get<Bloqueo[]>(
        `/bloqueos?${params.toString()}`
      );
      
      return data;
    } catch (error: any) {
      throw new Error(`Error al obtener bloqueos: ${error.message}`);
    }
  }

  async getBloqueo(idBloqueo: number): Promise<Bloqueo | null> {
    try {
      const { data } = await this.http.get<Bloqueo>(`/bloqueos/${idBloqueo}`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Error al obtener bloqueo: ${error.message}`);
    }
  }

  async createBloqueo(data: CreateBloqueoInput, createdBy: number): Promise<Bloqueo> {
    try {
      const payload = {
        id_cancha: data.id_cancha,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        motivo: data.motivo,
        es_recurrente: data.es_recurrente || false,
        recurrencia_tipo: data.recurrencia_tipo || null,
        created_by: createdBy
      };

      const { data: bloqueo } = await this.http.post<Bloqueo>('/bloqueos', payload);
      return bloqueo;
    } catch (error: any) {
      throw new Error(`Error al crear bloqueo: ${error.message}`);
    }
  }

  async deleteBloqueo(idBloqueo: number): Promise<boolean> {
    try {
      await this.http.delete(`/bloqueos/${idBloqueo}`);
      return true;
    } catch (error: any) {
      throw new Error(`Error al eliminar bloqueo: ${error.message}`);
    }
  }

  // Validaciones
  async existeConflictoHorario(
    idCancha: number, 
    diaSemana: string, 
    horaInicio: string, 
    horaFin: string, 
    excludeId?: number
  ): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      params.append('id_cancha', idCancha.toString());
      params.append('dia_semana', diaSemana);
      params.append('hora_inicio', horaInicio);
      params.append('hora_fin', horaFin);
      if (excludeId) params.append('exclude_id', excludeId.toString());

      const { data } = await this.http.get<{ conflicto: boolean }>(
        `/horarios/validar-conflicto?${params.toString()}`
      );
      
      return data.conflicto;
    } catch (error: any) {
      throw new Error(`Error al validar conflicto de horario: ${error.message}`);
    }
  }

  async existeConflictoBloqueo(
    idCancha: number, 
    fechaInicio: string, 
    fechaFin: string, 
    excludeId?: number
  ): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      params.append('id_cancha', idCancha.toString());
      params.append('fecha_inicio', fechaInicio);
      params.append('fecha_fin', fechaFin);
      if (excludeId) params.append('exclude_id', excludeId.toString());

      const { data } = await this.http.get<{ conflicto: boolean }>(
        `/bloqueos/validar-conflicto?${params.toString()}`
      );
      
      return data.conflicto;
    } catch (error: any) {
      throw new Error(`Error al validar conflicto de bloqueo: ${error.message}`);
    }
  }
}