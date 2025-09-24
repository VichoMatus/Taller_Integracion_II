export interface Horario {
  id_horario: number;
  id_complejo: number;
  id_cancha?: number;
  dia_semana: string;
  hora_apertura: string;
  hora_cierre: string;
}

export interface DisponibilidadSlot {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
  precio?: number;
}

export interface DisponibilidadConsulta {
  id_complejo?: number;
  id_cancha?: number;
  fecha_inicio: string;
  fecha_fin: string;
}