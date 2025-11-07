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
      
      console.log('🔄 [useComplejos] Cargando desde API...');
      
      const response = await complejosService.getComplejos();
      
      console.log('🔍 [useComplejos] Response RAW completo:', JSON.stringify(response, null, 2));
      
      let complejosData: any[] = [];
      
      if (Array.isArray(response)) {
        complejosData = response;
        console.log('✅ [useComplejos] Response es array directo');
      } else if (response && Array.isArray(response.data)) {
        complejosData = response.data;
        console.log('✅ [useComplejos] Array encontrado en response.data');
      } else if (response && Array.isArray(response.items)) {
        complejosData = response.items;
        console.log('✅ [useComplejos] Array encontrado en response.items');
      } else if (response && Array.isArray(response.complejos)) {
        complejosData = response.complejos;
        console.log('✅ [useComplejos] Array encontrado en response.complejos');
      } else {
        console.error('❌ [useComplejos] No se encontró array en la respuesta');
        throw new Error('No se encontró array de complejos en la respuesta');
      }
      
      console.log(`📊 [useComplejos] Complejos extraídos: ${complejosData.length}`);
      
      // 🔥 DEBUG CRÍTICO: VER ESTRUCTURA COMPLETA DEL PRIMER COMPLEJO
      if (complejosData.length > 0) {
        const primero = complejosData[0];
        console.log('🔍 [useComplejos] ========== PRIMER COMPLEJO RAW ==========');
        console.log(JSON.stringify(primero, null, 2));
        console.log('🔍 [useComplejos] ========================================');
        console.log('🔍 [useComplejos] Claves del objeto:', Object.keys(primero));
        console.log('🔍 [useComplejos] Intentando extraer ID con diferentes nombres:');
        console.log('  - primero.id_complejo:', primero.id_complejo);
        console.log('  - primero.id:', primero.id);
        console.log('  - primero.idComplejo:', primero.idComplejo);
        console.log('  - primero.complejo_id:', primero.complejo_id);
        console.log('  - primero.establecimiento_id:', primero.establecimiento_id);
        console.log('  - primero.establecimientoId:', primero.establecimientoId);
      }
      
      // 🔥 MAPEAR CON TODAS LAS VARIANTES POSIBLES DE CAMPO ID
      const complejosMapeados = complejosData.map((complejo: any, index: number) => {
        // 🔥 INTENTAR EXTRAER ID DE TODAS LAS FORMAS POSIBLES
        const id = complejo.id_complejo || 
                   complejo.id || 
                   complejo.idComplejo || 
                   complejo.complejo_id ||
                   complejo.establecimiento_id ||
                   complejo.establecimientoId ||
                   index + 1; // 🔥 ÚLTIMO RECURSO: usar índice + 1
        
        const nombre = complejo.nombre || `Complejo ${index + 1}`;
        const direccion = complejo.direccion || complejo.direccion_completa || complejo.address || 'Dirección no disponible';
        
        console.log(`🔄 [useComplejos] Mapeando complejo ${index + 1}:`);
        console.log(`  - ID extraído: ${id} (de: ${Object.keys(complejo).find(k => complejo[k] === id) || 'índice'})`);
        console.log(`  - Nombre: ${nombre}`);
        console.log(`  - Dirección: ${direccion}`);
        
        return {
          id_complejo: Number(id), // 🔥 ASEGURAR QUE SEA NÚMERO
          id_dueno: Number(complejo.id_dueno || complejo.idDueno || complejo.dueno_id || 1),
          nombre: nombre,
          direccion: direccion,
          comuna: complejo.comuna || 'Temuco',
          descripcion: complejo.descripcion || '',
          actividad: complejo.actividad || 'Deportes',
          rating_promedio: Number(complejo.rating_promedio || complejo.ratingPromedio || complejo.rating || 4.5),
          total_resenas: Number(complejo.total_resenas || complejo.totalResenas || complejo.reviews || 0),
          distancia_km: Number(complejo.distancia_km || complejo.distanciaKm || complejo.distance || 0),
          latitud: complejo.latitud ? Number(complejo.latitud) : (complejo.lat ? Number(complejo.lat) : -38.7359),
          longitud: complejo.longitud ? Number(complejo.longitud) : (complejo.lng || complejo.lon ? Number(complejo.lng || complejo.lon) : -72.5904)
        };
      });
      
      console.log('✅ [useComplejos] Complejos mapeados:', complejosMapeados.length);
      console.log('✅ [useComplejos] IDs finales:');
      complejosMapeados.forEach(c => {
        console.log(`  - ID ${c.id_complejo}: ${c.nombre}`);
      });
      
      // 🔥 VERIFICACIÓN FINAL: ASEGURAR QUE TODOS TENGAN ID
      const sinID = complejosMapeados.filter(c => !c.id_complejo || isNaN(c.id_complejo));
      if (sinID.length > 0) {
        console.error('❌ [useComplejos] Complejos sin ID válido:', sinID);
      }
      
      setComplejos(complejosMapeados);
      
    } catch (err: any) {
      console.error('❌ [useComplejos] Error completo:', err);
      console.error('❌ [useComplejos] Stack:', err.stack);
      setError(`Error cargando complejos: ${err.message}`);
      
      // 🔥 FALLBACK CON DATOS ESTÁTICOS
      console.warn('⚠️ [useComplejos] Usando datos de fallback');
      const complejosFallback: Complejo[] = [
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
        },
        {
          id_complejo: 4,
          id_dueno: 2,
          nombre: "🚨 FALLBACK - Complejo Deportivo Este",
          direccion: "Av. Balmaceda 456, Temuco, Chile",
          comuna: "Temuco",
          descripcion: "Complejo deportivo zona este",
          actividad: "Fútbol",
          rating_promedio: 4.3,
          total_resenas: 20,
          distancia_km: 2.0,
          latitud: -38.7380,
          longitud: -72.5800
        },
        {
          id_complejo: 5,
          id_dueno: 3,
          nombre: "🚨 FALLBACK - Complejo Deportivo Oeste",
          direccion: "Av. Caupolicán 789, Temuco, Chile",
          comuna: "Temuco",
          descripcion: "Complejo deportivo zona oeste",
          actividad: "Múltiples deportes",
          rating_promedio: 4.1,
          total_resenas: 15,
          distancia_km: 2.8,
          latitud: -38.7340,
          longitud: -72.6000
        },
        {
          id_complejo: 6,
          id_dueno: 3,
          nombre: "🚨 FALLBACK - Complejo Deportivo Pueblo Nuevo",
          direccion: "Av. Rudecindo Ortega 321, Temuco, Chile",
          comuna: "Temuco",
          descripcion: "Complejo deportivo Pueblo Nuevo",
          actividad: "Fútbol y tenis",
          rating_promedio: 4.4,
          total_resenas: 22,
          distancia_km: 1.5,
          latitud: -38.7320,
          longitud: -72.5950
        }
      ];
      
      setComplejos(complejosFallback);
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
    console.log('🔄 [useComplejos] Refresh manual solicitado');
    await loadComplejos();
  };

  useEffect(() => {
    console.log('🚀 [useComplejos] Hook montado, iniciando carga...');
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