/**
 * Hook optimizado para cargar canchas por deporte
 * Utiliza el nuevo servicio canchasportsServices.ts
 */
import { useState, useEffect } from 'react';
import { canchaService } from '../services/canchasportsServices';
import { complejosService } from '../services/complejosService';

export interface CanchaSport {
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
  techada?: boolean;
  activa?: boolean;
}

interface UseCanchasSportOptions {
  deporte: string; // Ej: 'futbol', 'basquet', 'tenis'
  deportesRelacionados?: string[]; // Ej: ['futsal', 'futbolito'] para fútbol
  fallbackComplejos?: Record<number, { nombre: string; direccion: string }>;
}

export const useCanchasSport = ({ 
  deporte, 
  deportesRelacionados = [], 
  fallbackComplejos 
}: UseCanchasSportOptions) => {
  const [canchas, setCanchas] = useState<CanchaSport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCanchas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const deportesBuscados = [deporte, ...deportesRelacionados];
        console.log(`🔄 [useCanchasSport] Cargando canchas para deportes:`, deportesBuscados);
        
        // 🔥 PASO 1: CARGAR TODAS LAS CANCHAS DEL DEPORTE PRINCIPAL
        const response = await canchaService.getCanchas({
          deporte: deporte
        });
        
        console.log('✅ [useCanchasSport] Respuesta:', response);
        
        // Extraer canchas de la respuesta
        const todasLasCanchas = response.items || (response as any).data || [];
        console.log('✅ [useCanchasSport] Total de canchas obtenidas:', todasLasCanchas.length);
        
        if (!Array.isArray(todasLasCanchas) || todasLasCanchas.length === 0) {
          console.warn('⚠️ [useCanchasSport] No se encontraron canchas');
          setCanchas([]);
          setLoading(false);
          return;
        }
        
        // 🔥 PASO 2: FILTRAR TAMBIÉN POR DEPORTES RELACIONADOS
        const canchasFiltradas = todasLasCanchas.filter((cancha: any) => {
          const tipoCancha = cancha.tipo?.toLowerCase();
          return deportesBuscados.some(dep => 
            tipoCancha === dep.toLowerCase()
          );
        });
        
        console.log(`⚽ [useCanchasSport] Canchas filtradas: ${canchasFiltradas.length}`);
        
        // 🔥 PASO 3: MAPEAR CANCHAS CON DATOS DE COMPLEJOS
        const canchasMapeadas = await Promise.all(
          canchasFiltradas.map(async (cancha: any) => {
            let complejoNombre = 'Complejo Deportivo';
            let complejoDireccion = 'Dirección no disponible';
            
            // Intentar obtener datos del complejo
            if (cancha.establecimientoId) {
              try {
                const complejoData = await complejosService.getComplejoById(cancha.establecimientoId);
                
                if (complejoData) {
                  complejoNombre = complejoData.nombre || complejoNombre;
                  complejoDireccion = complejoData.direccion || complejoDireccion;
                }
              } catch (complejoError: any) {
                console.warn(`⚠️ [useCanchasSport] Error cargando complejo ${cancha.establecimientoId}:`, complejoError.message);
                
                // Usar fallback si está disponible
                if (fallbackComplejos && fallbackComplejos[cancha.establecimientoId]) {
                  const fallback = fallbackComplejos[cancha.establecimientoId];
                  complejoNombre = fallback.nombre;
                  complejoDireccion = fallback.direccion;
                }
              }
            }
            
            // Mapear cancha al formato de UI
            const canchaMapeada: CanchaSport = {
              id: cancha.id,
              imageUrl: `/sports/${deporte}/canchas/Cancha${cancha.id}.png`,
              name: cancha.nombre || `Cancha ${cancha.id}`,
              address: `${complejoNombre} - ${complejoDireccion}`,
              rating: cancha.rating || cancha.promedioCalificacion || 4.5,
              tags: [
                cancha.techada ? "Techada" : "Al aire libre",
                cancha.activa ? "Disponible" : "No disponible",
                cancha.tipo ? cancha.tipo.charAt(0).toUpperCase() + cancha.tipo.slice(1) : "Deporte"
              ],
              description: `${cancha.tipo || 'Cancha'} - ${cancha.nombre || `Cancha ${cancha.id}`}`,
              price: cancha.precioPorHora?.toString() || cancha.price || "25",
              nextAvailable: cancha.activa ? "Disponible ahora" : "No disponible",
              sport: cancha.tipo || deporte,
              complejoNombre,
              complejoDireccion,
              techada: cancha.techada,
              activa: cancha.activa
            };
            
            return canchaMapeada;
          })
        );
        
        console.log('🎉 [useCanchasSport] Canchas mapeadas:', canchasMapeadas.length);
        setCanchas(canchasMapeadas);
        
      } catch (err: any) {
        console.error('❌ [useCanchasSport] Error:', err);
        setError(err.message || 'Error desconocido');
        setCanchas([]);
      } finally {
        setLoading(false);
      }
    };

    loadCanchas();
  }, [deporte, deportesRelacionados.join(',')]);

  return {
    canchas,
    loading,
    error
  };
};
