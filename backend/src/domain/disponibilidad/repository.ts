import { Horario, DisponibilidadSlot, DisponibilidadConsulta } from './entities';

export interface DisponibilidadRepository {
  getHorarios(idComplejo: number): Promise<Horario[]>;
  getDisponibilidad(consulta: DisponibilidadConsulta): Promise<DisponibilidadSlot[]>;
}