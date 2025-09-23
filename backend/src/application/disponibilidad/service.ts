import { DisponibilidadRepository } from '../../domain/disponibilidad/repository';
import { Horario, DisponibilidadSlot, DisponibilidadConsulta } from '../../domain/disponibilidad/entities';

export class DisponibilidadService {
  constructor(private disponibilidadRepository: DisponibilidadRepository) {}

  async getHorarios(idComplejo: number): Promise<Horario[]> {
    return this.disponibilidadRepository.getHorarios(idComplejo);
  }

  async getDisponibilidad(consulta: DisponibilidadConsulta): Promise<DisponibilidadSlot[]> {
    return this.disponibilidadRepository.getDisponibilidad(consulta);
  }
}