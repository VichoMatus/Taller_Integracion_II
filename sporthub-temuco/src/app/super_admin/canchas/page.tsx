'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { canchaService } from '@/services/canchaService';
import '@/app/admin/dashboard.css';

interface Court {
  id: string;
  name: string;
  location: string;
  status: 'Activo' | 'Inactivo' | 'Por revisar';
  type: string;
}

export default function CanchasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 4;

  // 🔥 NUEVO: Cargar canchas reales de la API
  useEffect(() => {
    const loadCourts = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Cargando canchas desde la API...');
        
        const canchasFromApi = await canchaService.getCanchas();
        console.log('✅ Canchas cargadas:', canchasFromApi);
        
        // Adaptar datos de la API al formato del frontend
        const adaptedCourts: Court[] = canchasFromApi.map((cancha: any) => ({
          id: cancha.id.toString(),
          name: cancha.nombre,
          location: `Establecimiento ${cancha.establecimientoId}`,
          status: cancha.activa ? 'Activo' : 'Inactivo',
          type: cancha.tipo
        }));
        
        setCourts(adaptedCourts);
      } catch (error: any) {
        console.error('❌ Error cargando canchas:', error);
        // Mantener datos de ejemplo como fallback
        setCourts([
          { id: '1', name: 'Cancha Central', location: 'Av. Principal 123', status: 'Activo', type: 'Futbol' },
          { id: '2', name: 'Cancha Sur', location: 'Av. Sur 456', status: 'Inactivo', type: 'Futbol' },
          { id: '3', name: 'Cancha Norte', location: 'Av. Norte 789', status: 'Por revisar', type: 'Tenis' },
          { id: '4', name: 'Cancha Este', location: 'Av. Este 321', status: 'Activo', type: 'Voleibol' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourts();
  }, []);

  const editCourt = (courtId: string) => {
    router.push(`/super_admin/canchas/${courtId}`);
  };

  // Filtrar canchas basado en búsqueda
  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         court.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Paginación
  const totalPages = Math.ceil(filteredCourts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourts = filteredCourts.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <div className="admin-dashboard-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '18px'
        }}>
          Cargando canchas...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header Principal */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Gestión de Canchas</h1>
        
        <div className="admin-controls">
          <button className="export-button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar informe
          </button>
          
          <button className="export-button" onClick={() => router.push('/super_admin/canchas/nueva')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Cancha
          </button>
        </div>
      </div>

      {/* Contenedor Principal de la Tabla */}
      <div className="admin-table-container">
        {/* Header de la Tabla */}
        <div className="admin-table-header">
          <h2 className="admin-table-title">Lista de Canchas ({filteredCourts.length})</h2>
          
          <div className="admin-search-filter">
            {/* Búsqueda */}
            <div className="admin-search-container">
              <input
                type="text"
                placeholder="Buscar por nombre o ubicación"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
              <svg className="admin-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Filtro */}
            <button className="btn-filtrar">
              Filtrar
            </button>
          </div>
        </div>
        
        {/* Tabla Principal */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCourts.map((court) => (
                <tr key={court.id}>
                  <td>
                    <div className="admin-cell-title">{court.name}</div>
                  </td>
                  <td>
                    <div className="admin-cell-subtitle">{court.location}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      court.status === 'Activo' ? 'status-activo' :
                      court.status === 'Inactivo' ? 'status-inactivo' :
                      'status-por-revisar'
                    }`}>
                      {court.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-cell-text">
                      {court.type.charAt(0).toUpperCase() + court.type.slice(1)}
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions-container">
                      <button 
                        className="btn-action btn-editar" 
                        title="Editar"
                        onClick={() => editCourt(court.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      
                      <button className="btn-action btn-aprobar" title="Aprobar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      
                      <button className="btn-action btn-eliminar" title="Eliminar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="admin-pagination-container">
          <div className="admin-pagination-info">
            mostrando {startIndex + 1} de {Math.min(startIndex + itemsPerPage, filteredCourts.length)} canchas
          </div>
          
          <div className="admin-pagination-controls">
            <button
              onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-pagination"
            >
              Anterior
            </button>
            
            <div className="admin-pagination-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`btn-pagination ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-pagination"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
