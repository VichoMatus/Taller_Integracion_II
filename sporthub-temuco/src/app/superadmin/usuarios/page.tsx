'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/app/admin/dashboard.css';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'Regular' | 'Premium' | 'Básico' | 'Empresa';
  status: 'Activo' | 'Inactivo' | 'Por revisar';
  lastAccess: string;
}

export default function UsuariosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Función para navegar a editar usuario
  const editUser = (userId: string) => {
    router.push(`/superadmin/usuarios/${userId}`);
  };

  // Datos de ejemplo basados en la imagen
  const users: User[] = [
    { id: '1', name: 'Ana Lopez', email: 'ana.lopez@gmail.com', type: 'Regular', status: 'Activo', lastAccess: 'Hoy, 19:03' },
    { id: '2', name: 'Admin123', email: 'admin123@gmail.com', type: 'Premium', status: 'Inactivo', lastAccess: '28-08-2025' },
    { id: '3', name: 'Juan Carlos', email: 'carlosjuan@gmail.com', type: 'Básico', status: 'Por revisar', lastAccess: 'Ayer, 16:45' },
    { id: '4', name: 'Monica Vega', email: 'monicavega@gmail.com', type: 'Empresa', status: 'Activo', lastAccess: 'Hoy, 11:35' },
  ];

  // Filtrar usuarios basado en búsqueda
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Función para obtener el color del badge de tipo
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Regular':
        return 'bg-blue-100 text-blue-800';
      case 'Premium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Básico':
        return 'bg-gray-100 text-gray-800';
      case 'Empresa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header Principal */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Gestión de Usuarios</h1>
        
        <div className="admin-controls">
          <button className="export-button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar informe
          </button>
          
          <button className="export-button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Usuario
          </button>
        </div>
      </div>

      {/* Contenedor Principal de la Tabla */}
      <div className="admin-table-container">
        {/* Header de la Tabla */}
        <div className="admin-table-header">
          <h2 className="admin-table-title">Lista de Usuarios</h2>
          
          <div className="admin-search-filter">
            {/* Búsqueda */}
            <div className="admin-search-container">
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
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
                <th>Email</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Último acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-cell-title">
                      <div className="admin-avatar">{user.name[0].toUpperCase()}</div>
                      {user.name}
                    </div>
                  </td>
                  <td>
                    <div className="admin-cell-subtitle">{user.email}</div>
                  </td>
                  <td>
                    <span className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${getTypeBadgeClass(user.type)}`}>
                      {user.type}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      user.status === 'Activo' ? 'status-activo' :
                      user.status === 'Inactivo' ? 'status-inactivo' :
                      'status-por-revisar'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-cell-text">{user.lastAccess}</div>
                  </td>
                  <td>
                    <div className="admin-actions-container">
                      {/* Botón Editar */}
                      <button 
                        className="btn-action btn-editar" 
                        title="Editar"
                        onClick={() => editUser(user.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      
                      {/* Botón Eliminar */}
                      <button className="btn-action btn-eliminar" title="Eliminar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      
                      {/* Botón Aprobar/Check (solo visible cuando el estado es "Por revisar") */}
                      {user.status === 'Por revisar' && (
                        <button className="btn-action btn-aprobar" title="Aprobar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
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
            mostrando {startIndex + 1} de {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
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
