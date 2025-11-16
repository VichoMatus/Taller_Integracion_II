'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resenaService } from '@/services/resenaService';
import { complejosService } from '@/services/complejosService';
import { Resena, ResenaListQuery } from '@/types/resena';
import { useAdminToast } from '@/components/admin/AdminToast';
import '../dashboard.css';

export default function ResenasPage() {
  const router = useRouter();
  
  // Estados del componente
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCalificacion, setSelectedCalificacion] = useState<number | ''>('');
  const [orderBy, setOrderBy] = useState<"recientes" | "mejor" | "peor">("recientes");
  const [totalResenas, setTotalResenas] = useState(0);
  const [complejoId, setComplejoId] = useState<number | null>(null);
  const [tipoVista, setTipoVista] = useState<'complejo' | 'canchas'>('complejo');
  const [itemsPerPage, setItemsPerPage] = useState(10); // 🔥 Dinámico según resolución

  // 🔥 Calcular items por página según altura de viewport
  useEffect(() => {
    const calculateItemsPerPage = () => {
      const height = window.innerHeight;
      // Cada fila de tabla ocupa ~80px, header ~250px, tabs ~60px, filtros ~100px, footer ~100px
      const availableHeight = height - 510;
      const rowHeight = 80;
      const calculatedItems = Math.floor(availableHeight / rowHeight);
      // Mínimo 5, máximo 20
      const finalItems = Math.max(5, Math.min(20, calculatedItems));
      setItemsPerPage(finalItems);
      console.log(`📐 Altura viewport: ${height}px → ${finalItems} reseñas por página`);
    };

    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, []);

  // Obtener el ID del complejo del admin actual
  useEffect(() => {
    const obtenerComplejoId = async () => {
      try {
        const userData = localStorage.getItem('userData');
        
        if (!userData) {
          console.error('❌ No hay datos de usuario en localStorage');
          setError('No se pudo identificar el complejo del administrador. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          return;
        }
        
        const user = JSON.parse(userData);
        console.log('👤 Usuario logueado:', user);
        
        // Primero intentar buscar complejo_id directamente en userData
        let complejoIdEncontrado = user.complejo_id || user.id_complejo || user.id_establecimiento;
        
        if (complejoIdEncontrado) {
          console.log('✅ Complejo ID encontrado en userData:', complejoIdEncontrado);
          setComplejoId(complejoIdEncontrado);
          return;
        }
        
        // Si no está en userData, hacer llamada a la API
        console.log('🔍 Complejo ID no encontrado en userData, consultando API...');
        console.log('🔍 ID de usuario:', user.id);
        
        const userId = user.id;
        
        if (!userId) {
          console.error('❌ No se encontró ID de usuario');
          setError('No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          return;
        }
        
        // Llamar a la API para obtener complejos del admin
        console.log(`📡 Llamando a getComplejosByAdmin(${userId})`);
        const complejos = await complejosService.getComplejosByAdmin(userId);
        
        console.log('📦 Complejos obtenidos:', complejos);
        
        if (complejos && complejos.length > 0) {
          // Tomar el primer complejo (un admin puede tener múltiples complejos)
          const primerComplejo = complejos[0];
          const complejoId = primerComplejo.id_complejo || primerComplejo.id;
          
          console.log('✅ Complejo ID obtenido de la API:', complejoId);
          setComplejoId(complejoId);
          
          // Opcional: Actualizar localStorage para futuras cargas
          try {
            const updatedUser = { ...user, complejo_id: complejoId };
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            console.log('💾 userData actualizado con complejo_id');
          } catch (err) {
            console.warn('⚠️ No se pudo actualizar localStorage:', err);
          }
        } else {
          console.warn('⚠️ No se encontraron complejos para el usuario');
          setError(`No se encontró ningún complejo asociado al usuario ${user.email || user.nombre}. Contacta al administrador.`);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('❌ Error al obtener complejo del usuario:', err);
        setError(`Error al identificar el complejo: ${err.message || 'Error desconocido'}. Por favor, recarga la página.`);
        setLoading(false);
      }
    };
    
    obtenerComplejoId();
  }, []);

  // Cargar reseñas del complejo
  const loadResenasComplejo = async () => {
    if (!complejoId) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🏢 [loadResenasComplejo] Cargando reseñas del complejo:', complejoId);
      
      const filters: ResenaListQuery = {
        complejoId: complejoId,
        page: currentPage,
        pageSize: itemsPerPage,
        order: orderBy
      };
      
      const data = await resenaService.listarResenas(filters);
      console.log('✅ [loadResenasComplejo] Reseñas obtenidas:', data?.length || 0);
      
      setResenas(data || []);
      setTotalResenas(data?.length || 0);
    } catch (err: any) {
      console.error('❌ [loadResenasComplejo] Error:', err);
      setError(err?.message || 'Error al cargar reseñas del complejo');
      setResenas([]);
    } finally {
      setLoading(false);
    }
  };

  const { show: showToast } = useAdminToast();

  // Cargar reseñas de todas las canchas del complejo
  const loadResenasCanchas = async () => {
    if (!complejoId) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🎾 [loadResenasCanchas] Obteniendo canchas del admin (complejo:', complejoId, ')');
      
      // Obtener las canchas del admin usando el endpoint /canchas/admin
      // Este endpoint ya filtra automáticamente por el complejo del admin logueado
      const canchas = await complejosService.getCanchasDeComplejo(complejoId);
      
      console.log('📋 [loadResenasCanchas] Canchas encontradas:', canchas?.length || 0);
      console.log('📋 [loadResenasCanchas] Estructura de canchas:', canchas);
      
      // Validar que canchas sea un array
      if (!canchas || !Array.isArray(canchas) || canchas.length === 0) {
        console.log('⚠️ [loadResenasCanchas] No hay canchas en el complejo o respuesta inválida');
        setResenas([]);
        setTotalResenas(0);
        setLoading(false);
        return;
      }
      
      // Obtener reseñas de cada cancha
      const todasLasResenas: Resena[] = [];
      
      for (const cancha of canchas) {
        console.log('🏟️ [loadResenasCanchas] Estructura de cancha individual:', JSON.stringify(cancha, null, 2));
        
        // El BFF devuelve id en camelCase
        const canchaId = cancha.id;
        
        if (!canchaId) {
          console.warn('⚠️ [loadResenasCanchas] Cancha sin ID, saltando:', cancha);
          continue;
        }
        
        console.log(`🔍 [loadResenasCanchas] Cargando reseñas de cancha #${canchaId}`);
        
        try {
          const filters: ResenaListQuery = {
            canchaId: canchaId,
            order: orderBy,
            page: 1,
            pageSize: 100 // Obtener todas para luego paginar localmente
          };
          
          const resenasCancha = await resenaService.listarResenas(filters);
          console.log(`  ✅ Cancha #${canchaId}: ${resenasCancha?.length || 0} reseñas`);
          
          if (resenasCancha && resenasCancha.length > 0) {
            todasLasResenas.push(...resenasCancha);
          }
        } catch (err) {
          console.warn(`  ⚠️ Error al cargar reseñas de cancha #${canchaId}:`, err);
          // Continuar con las demás canchas
        }
      }
      
      console.log('✅ [loadResenasCanchas] Total reseñas combinadas:', todasLasResenas.length);
      
      // Ordenar todas las reseñas combinadas
      const resenasOrdenadas = [...todasLasResenas].sort((a, b) => {
        if (orderBy === 'recientes') {
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
        } else if (orderBy === 'mejor') {
          return b.calificacion - a.calificacion;
        } else {
          return a.calificacion - b.calificacion;
        }
      });
      
      // Aplicar paginación local
      const inicio = (currentPage - 1) * itemsPerPage;
      const fin = inicio + itemsPerPage;
      const resenasPaginadas = resenasOrdenadas.slice(inicio, fin);
      
      setResenas(resenasPaginadas);
      setTotalResenas(resenasOrdenadas.length);
    } catch (err: any) {
      console.error('❌ [loadResenasCanchas] Error completo:', err);
      console.error('❌ [loadResenasCanchas] Error.message:', err?.message);
      console.error('❌ [loadResenasCanchas] Error.response:', err?.response);
      console.error('❌ [loadResenasCanchas] Error.response.data:', err?.response?.data);
      
      const errorMsg = err?.response?.data?.message || err?.message || 'Error al cargar reseñas de las canchas';
      setError(`Error en vista de canchas: ${errorMsg}`);
      setResenas([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar reseñas según el tipo de vista
  const loadResenas = async () => {
    if (tipoVista === 'complejo') {
      await loadResenasComplejo();
    } else {
      await loadResenasCanchas();
    }
  };

  // Efecto original actualizado
  const loadResenasOriginal = async () => {
    // No cargar si no tenemos el ID del complejo
    if (!complejoId) {
      console.log('⏳ [loadResenas] Esperando ID del complejo...');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [loadResenas] Cargando reseñas del complejo:', complejoId);
      
      const filters: ResenaListQuery = {
        complejoId: complejoId, // ✅ REQUERIDO: La API necesita filtro por canchaId O complejoId
        page: currentPage,
        pageSize: itemsPerPage,
        ...(selectedCalificacion && { 
          calificacionMin: selectedCalificacion, 
          calificacionMax: selectedCalificacion 
        })
      };
      
      const data = await resenaService.listarResenas(filters);
      setResenas(data);
    } catch (err: any) {
      console.warn('Backend no disponible, usando datos mock:', err);
      setError('Conectando con datos de desarrollo (backend no disponible)');
      // Usar datos mock en caso de error para development
      setResenas([
        {
          id: 1,
          usuarioId: 1,
          canchaId: 1,
          calificacion: 5,
          comentario: 'Excelente cancha, muy bien mantenida y con buen cesped.',
          estado: 'activa',
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString()
        },
        {
          id: 2,
          usuarioId: 2,
          canchaId: 1,
          calificacion: 4,
          comentario: 'Muy buena experiencia, solo faltaba un poco mas de iluminacion.',
          estado: 'activa',
          fechaCreacion: new Date(Date.now() - 86400000).toISOString(),
          fechaActualizacion: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResenas();
  }, [currentPage, orderBy, complejoId, tipoVista]);

  // Filtrar reseñas por término de búsqueda y calificación
  const filteredResenas = resenas.filter(resena => {
    const matchesSearch = !searchTerm || 
      resena.comentario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resena.usuarioId.toString().includes(searchTerm) ||
      (resena.canchaId && resena.canchaId.toString().includes(searchTerm)) ||
      (resena.complejoId && resena.complejoId.toString().includes(searchTerm));
    
    const matchesCalificacion = !selectedCalificacion || 
      resena.calificacion === selectedCalificacion;
    
    return matchesSearch && matchesCalificacion;
  });

  // Paginación mejorada
  const totalPages = Math.ceil(filteredResenas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResenas = filteredResenas.slice(startIndex, startIndex + itemsPerPage);

  // Funcion para navegar a editar resena
  const editResena = (resenaId: number | string) => {
    router.push(`/admin/resenas/${resenaId}`);
  };

  // Funcion para navegar a crear resena
  const createResena = () => {
    router.push('/admin/resenas/crear');
  };

  // Funcion para eliminar resena
  const deleteResena = async (resenaId: number | string) => {
    if (window.confirm('¿Estas seguro de que deseas eliminar esta resena?')) {
      try {
        const id = typeof resenaId === 'string' ? parseInt(resenaId, 10) : resenaId;
        await resenaService.eliminarResena(id);
        showToast('success', 'Reseña eliminada exitosamente');
        loadResenas(); // Recargar la lista
      } catch (err: any) {
        console.warn('No se pudo eliminar (backend no disponible):', err);
        showToast('error', 'No se puede eliminar en modo desarrollo (backend no disponible)');
      }
    }
  };

  // Funcion para obtener el emoji de calificacion
  const getCalificacionEmoji = (calificacion: number) => {
    const emojis = ['😡', '😞', '😐', '😊', '🤩'];
    return emojis[calificacion - 1] || '❓';
  };

  // Funcion para formatear fecha
  const formatFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <p>Cargando resenas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header Principal */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Gestión de Reseñas</h1>
        
        <div className="admin-controls">
          <button 
            className="export-button"
            onClick={() => loadResenas()}
            title="Recargar reseñas"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refrescar
          </button>

          <button className="export-button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar informe
          </button>
          
          <button className="export-button" onClick={createResena}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Reseña
          </button>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="filter-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`filter-tab ${tipoVista === 'complejo' ? 'active' : ''}`}
          onClick={() => {
            setTipoVista('complejo');
            setCurrentPage(1);
            loadResenas();
          }}
        >
          <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>📍</span>
          Reseñas del Complejo
        </button>
        
        <button
          className={`filter-tab ${tipoVista === 'canchas' ? 'active' : ''}`}
          onClick={() => {
            setTipoVista('canchas');
            setCurrentPage(1);
            loadResenas();
          }}
        >
          <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>⚽</span>
          Reseñas de las Canchas
        </button>
      </div>

      {/* Mensaje Informativo - Vista Actual */}
      {complejoId && (
        <div className={`info-banner ${tipoVista === 'complejo' ? 'info-blue' : 'info-green'}`}>
          <div className="info-icon">
            {tipoVista === 'complejo' ? '📍' : '⚽'}
          </div>
          <div className="info-content">
            <h3 className="info-title">
              {tipoVista === 'complejo' ? 'Reseñas del Complejo' : 'Reseñas de las Canchas'}
            </h3>
            <p className="info-text">
              {tipoVista === 'complejo' ? (
                <>
                  Mostrando reseñas directas del complejo <strong>#{complejoId}</strong>.
                  Estas son las valoraciones generales que los usuarios dejaron sobre tu complejo deportivo.
                </>
              ) : (
                <>
                  Mostrando reseñas de todas las canchas del complejo <strong>#{complejoId}</strong>.
                  Estas son las valoraciones específicas que los usuarios dejaron sobre canchas individuales.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Mensaje de Error */}
      {error && (
        <div className="info-banner info-red">
          <div className="info-icon">❌</div>
          <div className="info-content">
            <h3 className="info-title">Error al cargar reseñas</h3>
            <p className="info-text">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </p>
          </div>
        </div>
      )}

      {/* Contenedor Principal de la Tabla */}
      <div className="admin-table-container">
        {/* Header de la Tabla */}
        <div className="admin-table-header">
          <h2 className="admin-table-title">Lista de Resenas</h2>
          
          <div className="admin-search-filter">
            {/* Busqueda */}
            <div className="admin-search-container">
              <input
                type="text"
                placeholder="Buscar por comentario, usuario o cancha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
              <svg className="admin-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Filtro por Calificacion */}
            <div className="admin-filter-container">
              <select
                value={selectedCalificacion}
                onChange={(e) => setSelectedCalificacion(e.target.value ? parseInt(e.target.value) : '')}
                className="admin-filter-select"
              >
                <option value="">Todas las calificaciones</option>
                <option value={5}>⭐⭐⭐⭐⭐ (5 estrellas)</option>
                <option value={4}>⭐⭐⭐⭐ (4 estrellas)</option>
                <option value={3}>⭐⭐⭐ (3 estrellas)</option>
                <option value={2}>⭐⭐ (2 estrellas)</option>
                <option value={1}>⭐ (1 estrella)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>{tipoVista === 'canchas' ? '⚽ Cancha' : '📍 Ubicación'}</th>
                <th>Calificacion</th>
                <th>Comentario</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResenas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    {searchTerm || selectedCalificacion 
                      ? 'No se encontraron reseñas con los filtros aplicados' 
                      : 'No hay reseñas disponibles'}
                  </td>
                </tr>
              ) : (
                paginatedResenas.map((resena) => (
                  <tr key={resena.id}>
                    <td>#{resena.id}</td>
                    <td>Usuario #{resena.usuarioId}</td>
                    <td>
                      {tipoVista === 'canchas' ? (
                        <span style={{ 
                          backgroundColor: '#dbeafe', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          color: '#1e40af'
                        }}>
                          ⚽ Cancha #{resena.canchaId || 'N/A'}
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>
                          📍 Complejo #{resena.complejoId || 'N/A'}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="calificacion-cell">
                        <span className="calificacion-emoji">
                          {getCalificacionEmoji(resena.calificacion)}
                        </span>
                        <span className="calificacion-numero">
                          {resena.calificacion}/5
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="comentario-cell">
                        {resena.comentario ? (
                          resena.comentario.length > 50 
                            ? `${resena.comentario.substring(0, 50)}...`
                            : resena.comentario
                        ) : 'Sin comentario'}
                      </div>
                    </td>
                    <td>{formatFecha(resena.fechaCreacion)}</td>
                    <td>
                      <div className="admin-actions-container">
                        {/* Botón Ver */}
                        <button 
                          className="btn-action btn-ver" 
                          title="Ver detalles"
                          onClick={() => router.push(`/admin/resenas/${resena.id}`)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        {/* Botón Eliminar */}
                        <button 
                          className="btn-action btn-eliminar" 
                          title="Eliminar"
                          onClick={() => deleteResena(resena.id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="admin-pagination-container">
          <div className="admin-pagination-info">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredResenas.length)} de {filteredResenas.length} reseñas
          </div>
          
          <div className="admin-pagination-controls">
            <button 
              className="btn-pagination" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            
            <div className="admin-pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`btn-pagination ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button 
              className="btn-pagination" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
