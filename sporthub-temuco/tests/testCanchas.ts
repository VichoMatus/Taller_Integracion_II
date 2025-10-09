import { canchaService } from '../src/services/canchaService.ts';

(async () => {
  try {
    const canchas = await canchaService.getCanchas();
    console.log('Canchas disponibles:', canchas);
  } catch (error: any) {
    console.error('Error al obtener canchas:', error.message);
  }
})();