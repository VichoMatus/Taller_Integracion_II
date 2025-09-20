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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Panel de Gestión de Canchas
        </h1>
        <div className="flex gap-4">
          <Button variant="outline" className="export-button">
            Exportar Informe
          </Button>
          <Button variant="primary" className="add-court-button">
            Crear Cancha
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-700">
            Lista de Canchas
          </h2>
          <div className="w-64">
            <Input
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
