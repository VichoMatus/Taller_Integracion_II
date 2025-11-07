/**
 * Utilidades para el manejo de reservas
 * Funciones helper para formateo, conversión y validación
 */

import { EstadoReserva } from '../types/reserva';

/**
 * Formatea una fecha ISO a formato local
 */
export const formatearFecha = (fechaISO: string): string => {
  if (!fechaISO) return "Fecha no disponible";
  
  try {
    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) return fechaISO;
    
    return fecha.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
  } catch {
    return fechaISO;
  }
};

/**
 * Formatea una hora de string ISO o formato HH:MM
 */
export const formatearHora = (horaString: string): string => {
  if (!horaString) return "-";
  
  // Si es una fecha completa (contiene T), extraer solo la hora
  if (horaString.includes('T')) {
    return horaString.split('T')[1]?.slice(0, 5) || horaString;
  }
  
  // Si ya es solo hora (HH:MM:SS), tomar solo HH:MM
  if (horaString.includes(':')) {
    return horaString.slice(0, 5);
  }
  
  return horaString;
};

/**
 * Formatea un precio como moneda chilena
 */
export const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(precio);
};

/**
 * Obtiene el color CSS para un estado de reserva
 */
export const obtenerColorEstado = (estado: EstadoReserva): string => {
  const estadoLower = (estado || '').toLowerCase();
  
  if (estadoLower.includes('confirm')) return 'estado-confirmada';
  if (estadoLower.includes('pendiente')) return 'estado-pendiente';
  if (estadoLower.includes('cancel')) return 'estado-cancelada';
  if (estadoLower.includes('completada')) return 'estado-completada';
  if (estadoLower.includes('no_show')) return 'estado-no-show';
  
  return 'estado-confirmada'; // Por defecto
};

/**
 * Convierte una fecha y hora separadas en un timestamp ISO
 */
export const construirTimestampISO = (fecha: string, hora: string): string => {
  return `${fecha}T${hora}:00.000Z`;
};

/**
 * Extrae fecha y hora de un timestamp ISO
 */
export const extraerFechaHora = (timestampISO: string): { fecha: string; hora: string } => {
  if (!timestampISO.includes('T')) {
    return { fecha: '', hora: '' };
  }
  
  const [fecha, horaCompleta] = timestampISO.split('T');
  const hora = horaCompleta?.slice(0, 5) || '';
  
  return { fecha, hora };
};

/**
 * Valida si una fecha/hora es futura
 */
export const esFechaFutura = (fecha: string, hora: string): boolean => {
  try {
    const fechaHora = new Date(`${fecha}T${hora}:00`);
    return fechaHora > new Date();
  } catch {
    return false;
  }
};

/**
 * Valida que la hora de fin sea posterior a la hora de inicio
 */
export const validarHorarios = (horaInicio: string, horaFin: string): boolean => {
  try {
    const [horaI, minI] = horaInicio.split(':').map(Number);
    const [horaF, minF] = horaFin.split(':').map(Number);
    
    const inicioMinutos = horaI * 60 + minI;
    const finMinutos = horaF * 60 + minF;
    
    return finMinutos > inicioMinutos;
  } catch {
    return false;
  }
};

/**
 * Calcula la duración en horas entre dos horarios
 */
export const calcularDuracion = (horaInicio: string, horaFin: string): number => {
  try {
    const [horaI, minI] = horaInicio.split(':').map(Number);
    const [horaF, minF] = horaFin.split(':').map(Number);
    
    const inicioMinutos = horaI * 60 + minI;
    const finMinutos = horaF * 60 + minF;
    
    return (finMinutos - inicioMinutos) / 60;
  } catch {
    return 0;
  }
};

/**
 * Formatear duración en texto legible
 */
export const formatearDuracion = (horas: number): string => {
  if (horas === 0) return '0 horas';
  if (horas === 1) return '1 hora';
  if (horas < 1) return `${Math.round(horas * 60)} minutos`;
  if (horas % 1 === 0) return `${horas} horas`;
  
  const horasEnteras = Math.floor(horas);
  const minutos = Math.round((horas % 1) * 60);
  
  return `${horasEnteras}h ${minutos}m`;
};

/**
 * Genera un rango de horas para selección (08:00 - 22:00)
 */
export const generarOpcionesHorario = (intervaloMinutos: number = 30): string[] => {
  const opciones: string[] = [];
  
  for (let hora = 8; hora <= 22; hora++) {
    for (let minuto = 0; minuto < 60; minuto += intervaloMinutos) {
      const horaStr = hora.toString().padStart(2, '0');
      const minutoStr = minuto.toString().padStart(2, '0');
      opciones.push(`${horaStr}:${minutoStr}`);
    }
  }
  
  return opciones;
};

/**
 * Detecta si una string es un formato de fecha/hora nuevo o legacy
 */
export const esFormatoNuevo = (input: any): boolean => {
  return input && 
         typeof input === 'object' &&
         'id_cancha' in input &&
         'fecha' in input &&
         'inicio' in input &&
         'fin' in input;
};
