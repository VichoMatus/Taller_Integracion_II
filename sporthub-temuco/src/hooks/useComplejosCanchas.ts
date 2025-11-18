import { useState, useEffect } from 'react';
import { canchaService } from '../services/canchaService';
import { complejosService } from '../services/complejosService';

export interface CanchaMapeada {
  id: number;
  imageUrl: string;
  name: string;
  address: string;
  rating: number;
  tags: string[];
  description: string;
  price: string;
  nextAvailable: string;
  sport: string;
  complejoNombre?: string;
  complejoDireccion?: string;
}

interface UseComplejosCanchasOptions {
  deportes: string[]; // Ej: ['futbol', 'futsal', 'futbolito']
  fallbackComplejos?: Record<number, { nombre: string; direccion: string }>;
}

export const useComplejosCanchas = ({ deportes, fallbackComplejos }: UseComplejosCanchasOptions) => {
  const [canchas, setCanchas] = useState<CanchaMapeada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCanchas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 [useComplejosCanchas] Cargando canchas para deportes:`, deportes);
        
        // 🔥 PASO 1: OBTENER TODAS LAS CANCHAS
        const response = await canchaService.getCanchas();
        console.log('✅ [useComplejosCanchas] Respuesta de canchas:', response);
        
        // Extraer el array de canchas de la respuesta
        const todasLasCanchas = response.items || [];
        console.log('✅ [useComplejosCanchas] Total de canchas obtenidas:', todasLasCanchas.length);
        
        if (!Array.isArray(todasLasCanchas) || todasLasCanchas.length === 0) {
          console.warn('⚠️ [useComplejosCanchas] No se encontraron canchas');
          setCanchas([]);
          setLoading(false);
          return;
        }
        
        // 🔥 PASO 2: FILTRAR POR TIPO DE DEPORTE
        const canchasFiltradas = todasLasCanchas.filter((cancha: any) => {
          const tipoCancha = cancha.tipo?.toLowerCase();
          const esDeporteValido = deportes.some(deporte => 
            tipoCancha === deporte.toLowerCase()
          );
          
          if (esDeporteValido) {
            console.log(`✅ [useComplejosCanchas] Cancha ${cancha.id} (${cancha.tipo}) incluida`);
          }
          
          return esDeporteValido;
        });
        
        console.log(`⚽ [useComplejosCanchas] Canchas filtradas: ${canchasFiltradas.length}`);
        
        // 🔥 PASO 3: OBTENER DATOS DE COMPLEJOS PARA CADA CANCHA
        const canchasMapeadas = await Promise.all(
          canchasFiltradas.map(async (cancha: any) => {
            let complejoNombre = 'Complejo Deportivo';
            let complejoDireccion = 'Dirección no disponible';
            
            // 🔥 INTENTAR OBTENER DATOS DEL COMPLEJO
            if (cancha.establecimientoId) {
              try {
                console.log(`🔍 [useComplejosCanchas] Obteniendo complejo ${cancha.establecimientoId} para cancha ${cancha.id}`);
                const complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
                
                if (complejoData) {
                  complejoNombre = complejoData.nombre || complejoNombre;
                  complejoDireccion = complejoData.direccion || complejoDireccion;
                  console.log(`✅ [useComplejosCanchas] Complejo encontrado: ${complejoNombre}`);
                }
                
              } catch (complejoError: any) {
                console.warn(`⚠️ [useComplejosCanchas] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
                
                // 🔥 USAR FALLBACK SI ESTÁ DISPONIBLE
                if (fallbackComplejos && fallbackComplejos[cancha.establecimientoId]) {
                  const fallback = fallbackComplejos[cancha.establecimientoId];
                  complejoNombre = fallback.nombre;
                  complejoDireccion = fallback.direccion;
                  console.log(`🔄 [useComplejosCanchas] Usando datos de fallback para complejo ${cancha.establecimientoId}`);
                }
              }
            }
            
            // 🔥 MAPEAR CANCHA CON DATOS DEL COMPLEJO
            const canchaMapeada: CanchaMapeada = {
              id: cancha.id,
              imageUrl: `/sports/${deportes[0]}/canchas/Cancha${cancha.id}.png`,
              name: cancha.nombre || `Cancha ${cancha.id}`,
              address: `${complejoNombre} - ${complejoDireccion}`,
              rating: cancha.promedioCalificacion || 4.5,
              tags: [
                cancha.techada ? "Techada" : "Al aire libre",
                cancha.activa ? "Disponible" : "No disponible",
                cancha.tipo ? cancha.tipo.charAt(0).toUpperCase() + cancha.tipo.slice(1) : "Deporte"
              ],
              description: `${cancha.tipo || 'Cancha'} - ${cancha.nombre || `Cancha ${cancha.id}`}`,
              price: cancha.precioPorHora?.toString() || "25",
              nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
              sport: cancha.tipo || deportes[0],
              complejoNombre,
              complejoDireccion
            };
            
            return canchaMapeada;
          })
        );
        
        console.log('🎉 [useComplejosCanchas] Canchas mapeadas con datos de complejo:', canchasMapeadas.length);
        setCanchas(canchasMapeadas);
        setLoading(false);
        
      } catch (err: any) {
        console.error('❌ [useComplejosCanchas] Error cargando canchas:', err);
        setError(err.message || 'Error desconocido');
        setCanchas([]);
        setLoading(false);
      }
    };

    loadCanchas();
  }, [deportes.join(',')]); // Re-ejecutar si cambian los deportes

  return {
    canchas,
    loading,
    error
  };
};
