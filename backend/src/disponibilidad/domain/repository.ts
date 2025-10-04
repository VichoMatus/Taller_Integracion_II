import { 
  Horario, 
  Bloqueo, 
  DisponibilidadSlot, 
  DisponibilidadConsulta,
  CreateHorarioInput,
  UpdateHorarioInput,
  CreateBloqueoInput
} from './entities';

/**
 * Repository interface para disponibilidad
 * Define los contratos para el acceso a datos de disponibilidad
 */
export interface DisponibilidadRepository {
  // Disponibilidad
  getDisponibilidad(consulta: DisponibilidadConsulta): Promise<DisponibilidadSlot[]>;
  
  // Horarios
  getHorarios(idComplejo: number, idCancha?: number): Promise<Horario[]>;
  getHorario(idHorario: number): Promise<Horario | null>;
  createHorario(data: CreateHorarioInput): Promise<Horario>;
  updateHorario(idHorario: number, data: UpdateHorarioInput): Promise<Horario>;
  deleteHorario(idHorario: number): Promise<boolean>;
  
  // Bloqueos
  getBloqueos(idComplejo: number, idCancha?: number): Promise<Bloqueo[]>;
  getBloqueo(idBloqueo: number): Promise<Bloqueo | null>;
  createBloqueo(data: CreateBloqueoInput, createdBy: number): Promise<Bloqueo>;
  deleteBloqueo(idBloqueo: number): Promise<boolean>;
  
  // Validaciones
  existeConflictoHorario(idCancha: number, diaSeamana: string, horaInicio: string, horaFin: string, excludeId?: number): Promise<boolean>;
  existeConflictoBloqueo(idCancha: number, fechaInicio: string, fechaFin: string, excludeId?: number): Promise<boolean>;
}