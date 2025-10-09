import { DisponibilidadRepository } from '../domain/repository';
import { 
  DisponibilidadSlot, 
  DisponibilidadConsulta,
  Horario,
  Bloqueo,
  CreateHorarioInput,
  UpdateHorarioInput,
  CreateBloqueoInput
} from '../domain/entities';

/**
 * Caso de uso: Obtener disponibilidad de canchas
 */
export class GetDisponibilidad {
  constructor(private repository: DisponibilidadRepository) {}

  async execute(consulta: DisponibilidadConsulta): Promise<DisponibilidadSlot[]> {
    if (!consulta.fecha_inicio || !consulta.fecha_fin) {
      throw new Error('fecha_inicio y fecha_fin son requeridas');
    }

    if (new Date(consulta.fecha_inicio) > new Date(consulta.fecha_fin)) {
      throw new Error('fecha_inicio no puede ser mayor a fecha_fin');
    }

    return await this.repository.getDisponibilidad(consulta);
  }
}

/**
 * Caso de uso: Listar horarios
 */
export class ListHorarios {
  constructor(private repository: DisponibilidadRepository) {}

  async execute(idComplejo: number, idCancha?: number): Promise<Horario[]> {
    if (!idComplejo || idComplejo <= 0) {
      throw new Error('id_complejo debe ser un número válido');
    }

    return await this.repository.getHorarios(idComplejo, idCancha);
  }
}

/**
 * Caso de uso: Obtener horario específico
 */
export class GetHorario {
  constructor(private repository: DisponibilidadRepository) {}

  async execute(idHorario: number): Promise<Horario> {
    if (!idHorario || idHorario <= 0) {
      throw new Error('id_horario debe ser un número válido');
    }

    const horario = await this.repository.getHorario(idHorario);
    if (!horario) {
      throw new Error('Horario no encontrado');
    }

    return horario;
  }
}

/**
 * Caso de uso: Crear horario
 */
export class CreateHorario {
  constructor(private repository: DisponibilidadRepository) {}

  async execute(data: CreateHorarioInput): Promise<Horario> {
    // Validaciones
    this.validateHorarioInput(data);

    // Verificar conflictos
    const conflicto = await this.repository.existeConflictoHorario(
      data.id_cancha || 0,
      data.dia_semana,
      data.hora_apertura,
      data.hora_cierre
    );

    if (conflicto) {
      throw new Error('Ya existe un horario para este día y cancha que se superpone');
    }

    return await this.repository.createHorario(data);
  }

  private validateHorarioInput(data: CreateHorarioInput): void {
    if (!data.id_complejo || data.id_complejo <= 0) {
      throw new Error('id_complejo es requerido');
    }

    if (!data.dia_semana) {
      throw new Error('dia_semana es requerido');
    }

    const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo', 'todos'];
    if (!diasValidos.includes(data.dia_semana.toLowerCase())) {
      throw new Error('dia_semana debe ser un día válido o "todos"');
    }

    if (!this.isValidTimeFormat(data.hora_apertura) || !this.isValidTimeFormat(data.hora_cierre)) {
      throw new Error('Formato de hora inválido. Use HH:MM');
    }

    if (data.hora_apertura >= data.hora_cierre) {
      throw new Error('hora_apertura debe ser menor a hora_cierre');
    }
  }

  private isValidTimeFormat(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }
}

/**
 * Caso de uso: Actualizar horario
 */
export class UpdateHorario {
  constructor(private repository: DisponibilidadRepository) {}

  async execute(idHorario: number, data: UpdateHorarioInput): Promise<Horario> {
    if (!idHorario || idHorario <= 0) {
      throw new Error('id_horario debe ser un número válido');
    }

    // Verificar que existe
    const horarioExistente = await this.repository.getHorario(idHorario);
    if (!horarioExistente) {
      throw new Error('Horario no encontrado');
    }

    // Validaciones si se están actualizando horarios
    if (data.hora_apertura && data.hora_cierre) {
      if (data.hora_apertura >= data.hora_cierre) {
        throw new Error('hora_apertura debe ser menor a hora_cierre');
      }
    }

    return await this.repository.updateHorario(idHorario, data);
  }
}

/**
 * Caso de uso: Eliminar horario
 */
export class DeleteHorario {
  constructor(private repository: DisponibilidadRepository) {}

  async execute(idHorario: number): Promise<boolean> {
    if (!idHorario || idHorario <= 0) {
      throw new Error('id_horario debe ser un número válido');
    }

    // Verificar que existe
    const horario = await this.repository.getHorario(idHorario);
    if (!horario) {
      throw new Error('Horario no encontrado');
    }

    return await this.repository.deleteHorario(idHorario);
  }
}

/**
 * Caso de uso: Listar bloqueos
 */
export class ListBloqueos {
  constructor(private repository: DisponibilidadRepository) {}

  async execute(idComplejo: number, idCancha?: number): Promise<Bloqueo[]> {
    if (!idComplejo || idComplejo <= 0) {
      throw new Error('id_complejo debe ser un número válido');
    }

    return await this.repository.getBloqueos(idComplejo, idCancha);
  }
}

/**
 * Caso de uso: Obtener bloqueo específico
 */
export class GetBloqueo {
  constructor(private repository: DisponibilidadRepository) {}

  async execute(idBloqueo: number): Promise<Bloqueo> {
    if (!idBloqueo || idBloqueo <= 0) {
      throw new Error('id_bloqueo debe ser un número válido');
    }

    const bloqueo = await this.repository.getBloqueo(idBloqueo);
    if (!bloqueo) {
      throw new Error('Bloqueo no encontrado');
    }

    return bloqueo;
  }
}

/**
 * Caso de uso: Crear bloqueo
 */
export class CreateBloqueo {
  constructor(private repository: DisponibilidadRepository) {}

  async execute(data: CreateBloqueoInput, createdBy: number): Promise<Bloqueo> {
    // Validaciones
    this.validateBloqueoInput(data);

    // Verificar conflictos
    const conflicto = await this.repository.existeConflictoBloqueo(
      data.id_cancha,
      data.fecha_inicio,
      data.fecha_fin
    );

    if (conflicto) {
      throw new Error('Ya existe un bloqueo para este rango de fechas y cancha');
    }

    return await this.repository.createBloqueo(data, createdBy);
  }

  private validateBloqueoInput(data: CreateBloqueoInput): void {
    if (!data.id_cancha || data.id_cancha <= 0) {
      throw new Error('id_cancha es requerido');
    }

    if (!data.fecha_inicio || !data.fecha_fin) {
      throw new Error('fecha_inicio y fecha_fin son requeridas');
    }

    const fechaInicio = new Date(data.fecha_inicio);
    const fechaFin = new Date(data.fecha_fin);
    const ahora = new Date();

    if (fechaInicio > fechaFin) {
      throw new Error('fecha_inicio no puede ser mayor a fecha_fin');
    }

    if (fechaInicio < ahora) {
      throw new Error('No se pueden crear bloqueos en fechas pasadas');
    }

    if (!data.motivo || data.motivo.trim().length === 0) {
      throw new Error('motivo es requerido');
    }

    if (data.es_recurrente && !data.recurrencia_tipo) {
      throw new Error('recurrencia_tipo es requerido para bloqueos recurrentes');
    }
  }
}

/**
 * Caso de uso: Eliminar bloqueo
 */
export class DeleteBloqueo {
  constructor(private repository: DisponibilidadRepository) {}

  async execute(idBloqueo: number): Promise<boolean> {
    if (!idBloqueo || idBloqueo <= 0) {
      throw new Error('id_bloqueo debe ser un número válido');
    }

    // Verificar que existe
    const bloqueo = await this.repository.getBloqueo(idBloqueo);
    if (!bloqueo) {
      throw new Error('Bloqueo no encontrado');
    }

    return await this.repository.deleteBloqueo(idBloqueo);
  }
}