import { useState, useEffect } from 'react';
import { complejosService } from '../services/complejosService';

export interface ComplejoBasico {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  comuna: string;
  activo: boolean;
  duenioId?: number;
  totalResenas?: number;
  promedioCalificacion?: number;
}

export const useComplejos = () => {
  const [complejos, setComplejos] = useState<ComplejoBasico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComplejos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 [useComplejos] Cargando complejos desde API...');
        const response = await complejosService.getComplejos();
        
        console.log('✅ [useComplejos] Respuesta completa de complejos:', response);
        console.log('✅ [useComplejos] Tipo de respuesta:', typeof response);
        console.log('✅ [useComplejos] Es array?', Array.isArray(response));
        console.log('✅ [useComplejos] Keys de respuesta:', Object.keys(response));

        let complejosArray: ComplejoBasico[] = [];

        // 🔥 VERIFICAR ESTRUCTURA DE LA RESPUESTA
        if (Array.isArray(response)) {
          // Si response es directamente un array
          complejosArray = response;
          console.log('📦 [useComplejos] Array directo de complejos');
        } else if (response && typeof response === 'object') {
          // Si response es un objeto con datos anidados
          if (Array.isArray(response.items)) {
            complejosArray = response.items;
            console.log('📦 [useComplejos] Array encontrado en response.items');
          } else if (Array.isArray(response.data)) {
            complejosArray = response.data;
            console.log('📦 [useComplejos] Array encontrado en response.data');
          } else if (Array.isArray(response.complejos)) {
            complejosArray = response.complejos;
            console.log('📦 [useComplejos] Array encontrado en response.complejos');
          } else {
            console.error('❌ [useComplejos] No se encontró array de complejos en la respuesta:', response);
            throw new Error('Formato de respuesta inválido');
          }
        }

        // Validar que tengamos datos
        if (!Array.isArray(complejosArray) || complejosArray.length === 0) {
          console.warn('⚠️ [useComplejos] No se encontraron complejos');
          setComplejos([]);
          setLoading(false);
          return;
        }

        console.log('✅ [useComplejos] Complejos cargados exitosamente:', complejosArray.length);
        console.log('📋 [useComplejos] Primer complejo:', complejosArray[0]);
        
        setComplejos(complejosArray);
        setLoading(false);
        
      } catch (err: any) {
        console.error('❌ [useComplejos] Error cargando complejos:', err);
        setError(err.message || 'Error desconocido');
        setComplejos([]);
        setLoading(false);
      }
    };

    loadComplejos();
  }, []);

  return {
    complejos,
    loading,
    error
  };
};
