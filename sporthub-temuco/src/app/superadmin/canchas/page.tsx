'use client';

import { useState } from 'react';
import { Court } from '@/types/admin';
import DataTable, { Column } from '@/components/ui/Datatable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import '../styles/adminPanel.css';

export default function CourtsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datos de ejemplo - En produccion vendrian de la API
  const courts: Court[] = [
    {
      id: '1',
      nombre: 'Cancha Central',
      ubicacion: 'Av. Principal 123',
      estado: 'Activo',
      tipo: 'Futbol'
    },
    {
      id: '2',
      nombre: 'Cancha Norte',
      ubicacion: 'Av. Principal 123',
      estado: 'Inactivo',
      tipo: 'Futbol'
    },
    {
      id: '3',
      nombre: 'Cancha Sur',
      ubicacion: 'Av. Principal 123',
      estado: 'Por revisar',
      tipo: 'Tenis'
    },
    {
      id: '4',
      nombre: 'Cancha Este',
      ubicacion: 'Av. Principal 123',
      estado: 'Activo',
      tipo: 'Volleyball'
    }
  ];

  const columns: Column<Court>[] = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      sortable: true
    },
    {
      header: 'Ubicación',
      accessor: 'ubicacion',
      sortable: true
    },
    {
      header: 'Estado',
      accessor: (court) => (
        <span className={`status-badge ${
          court.estado === 'Activo' ? 'status-active' :
          court.estado === 'Inactivo' ? 'status-inactive' :
          'status-pending'
        }`}>
          {court.estado}
        </span>
      )
    },
    {
      header: 'Tipo',
      accessor: 'tipo',
      sortable: true
    }
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCourts = courts.filter(court => 
    court.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    court.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    court.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h1>Panel de Gestión de Canchas</h1>
        <div className="header-actions">
          <Button variant="secondary" className="export-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Exportar Informe</span>
          </Button>
          <Button variant="primary" className="add-button">
            <span>+</span>
            <span>Crear Cancha</span>
          </Button>
        </div>
      </div>

      <div className="panel-content">
        <div className="content-header">
          <h2>Lista de Canchas</h2>
          <div className="header-controls">
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>

        <DataTable
          data={filteredCourts}
          columns={columns}
          keyExtractor={(item: Court) => item.id}
          onEdit={(court: Court) => console.log('Editar', court)}
          onDelete={(court: Court) => console.log('Eliminar', court)}
          showActions={true}
        />
      </div>
    </div>
  );
}
