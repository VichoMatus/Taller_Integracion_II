import { useState, useEffect } from 'react';
import { complejosService } from '@/services/complejosService';

export interface Complejo {
  id_complejo: number;
  id_dueno: number;
  nombre: string;
  direccion: string;
  comuna: string;
  descripcion: string;
  actividad: string;
  rating_promedio: number;
  total_resenas: number;
  distancia_km: number;
  latitud?: number;
  longitud?: number;
}

interface UseComplejosReturn {
  complejos: Complejo[];
  loading: boolean;
  error: string | null;
  getComplejoById: (id: number) => Complejo | null;
  refreshComplejos: () => Promise<void>;
}

export const useComplejos = (): UseComplejosReturn => {
  const [complejos, setComplejos] = useState<Complejo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComplejos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useComplejos] Cargando complejos desde API...');
      
      const response = await complejosService.getComplejos();
      console.log('✅ [useComplejos] Respuesta de complejos:', response);
      
      // 🔥 VALIDAR ESTRUCTURA DE LA RESPUESTA
      const complejosData = Array.isArray(response) 
        ? response 
        : Array.isArray(response?.data) 
          ? response.data 
          : Array.isArray(response?.items) 
            ? response.items 
            : [];
      
      if (!Array.isArray(complejosData)) {
        throw new Error('La respuesta no contiene un array válido de complejos');
      }
      
      console.log('✅ [useComplejos] Complejos cargados:', complejosData.length);
      setComplejos(complejosData);
      
    } catch (err: any) {
      console.error('❌ [useComplejos] Error cargando complejos:', err);
      setError(`Error cargando complejos: ${err.message}`);
      
      // 🔥 FALLBACK CON COMPLEJOS ESTÁTICOS
      const complejosEstaticos: Complejo[] = [
        {
          id_complejo: 1,
          id_dueno: 1,
          nombre: "🚨 FALLBACK - Complejo Deportivo Norte",
          direccion: "Av. Alemania 1234, Temuco, Chile",
          comuna: "Temuco",
          descripcion: "Complejo deportivo con canchas de fútbol",
          actividad: "Fútbol",
          rating_promedio: 4.5,
          total_resenas: 25,
          distancia_km: 2.5,
          latitud: -38.7359,
          longitud: -72.5904
        },
        {
          id_complejo: 2,
          id_dueno: 1,
          nombre: "🚨 FALLBACK - Complejo Deportivo Centro",
          direccion: "Av. Pedro de Valdivia 567, Temuco, Chile",
          comuna: "Temuco",
          descripcion: "Complejo deportivo céntrico",
          actividad: "Múltiples deportes",
          rating_promedio: 4.2,
          total_resenas: 18,
          distancia_km: 1.8,
          latitud: -38.7400,
          longitud: -72.5900
        },
        {
          id_complejo: 3,
          id_dueno: 2,
          nombre: "🚨 FALLBACK - Complejo Deportivo Sur",
          direccion: "Calle Montt 890, Temuco, Chile",
          comuna: "Temuco",
          descripcion: "Complejo deportivo zona sur",
          actividad: "Fútbol y básquet",
          rating_promedio: 4.0,
          total_resenas: 12,
          distancia_km: 3.2,
          latitud: -38.7450,
          longitud: -72.5850
        }
      ];
      
      setComplejos(complejosEstaticos);
      console.log('⚠️ [useComplejos] Usando complejos de fallback');
      
    } finally {
      setLoading(false);
    }
  };

  const getComplejoById = (id: number): Complejo | null => {
    const complejo = complejos.find(c => c.id_complejo === id);
    console.log(`🔍 [useComplejos] Buscando complejo ID ${id}:`, complejo);
    return complejo || null;
  };

  const refreshComplejos = async () => {
    await loadComplejos();
  };

  useEffect(() => {
    loadComplejos();
  }, []);

  return {
    complejos,
    loading,
    error,
    getComplejoById,
    refreshComplejos
  };
};