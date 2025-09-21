'use client';

import { useState } from 'react';
import { Admin } from '@/types/admin';
import type { Column } from '@/components/ui/Datatable';
import DataTable from '@/components/ui/Datatable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import '../dashboard.css';

export default function AdminsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const admins: Admin[] = [
    {
      id: '1',
      nombre: 'Ana Lopez',
      email: 'ana.lopez@gmail.com',
      estado: 'Activo',
      fechaRegistro: '30-08-2025'
    },
    {
      id: '2',
      nombre: 'Admin123',
      email: 'admin123@gmail.com',
      estado: 'Inactivo',
      fechaRegistro: '28-08-2025'
    },
    {
      id: '3',
      nombre: 'Juan Carlos',
      email: 'carlosjuan@gmail.com',
      estado: 'Pendiente',
      fechaRegistro: '20-08-2025'
    },
    {
      id: '4',
      nombre: 'María Gonzales',
      email: 'maria.gonzal@gmail.com',
      estado: 'Activo',
      fechaRegistro: '15-07-2025'
    }
  ];

  const columns: Column<Admin>[] = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      sortable: true
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true
    },
    {
      header: 'Estado',
      accessor: (admin) => <StatusBadge status={admin.estado} />
    },
    {
      header: 'Fecha de registro',
      accessor: 'fechaRegistro',
      sortable: true
    },
    {
      header: 'Acciones',
      accessor: (admin) => (
        <div className="action-buttons">
          <button className="action-btn edit">✏️</button>
          <button className="action-btn delete">🗑️</button>
        </div>
      )
    }
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredAdmins = admins.filter(admin => 
    admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h1>Panel de Gestión de Administradores</h1>
        <div className="header-actions">
          <Button variant="secondary" className="export-button">
            Exportar Informe
          </Button>
          <Button variant="primary" className="add-button">
            Agregar Administrador
          </Button>
        </div>
      </div>

      <div className="panel-content">
        <div className="content-header">
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <DataTable
          data={filteredAdmins}
          columns={columns}
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  );
}