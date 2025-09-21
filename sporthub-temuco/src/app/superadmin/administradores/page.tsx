'use client';

import { useState } from 'react';
import { Admin } from '@/types/admin';
import type { Column } from '@/components/ui/Datatable';
import DataTable from '@/components/ui/Datatable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import '../styles/adminPanel.css';
import '../styles/components.css';

export default function AdminsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Datos de ejemplo - En producción vendrían de una API
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
      accessor: (admin) => (
        <span className={`status-badge ${
          admin.estado === 'Activo' ? 'status-active' :
          admin.estado === 'Inactivo' ? 'status-inactive' :
          'status-pending'
        }`}>
          {admin.estado}
        </span>
      )
    },
    {
      header: 'Fecha de registro',
      accessor: 'fechaRegistro',
      sortable: true
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
    <>
      <div className="welcome-header">
        <h2 className="text-lg font-medium">Bienvenido, Superadministrador.</h2>
        <div className="search-container">
          <Input
            type="text"
            placeholder="Buscar..."
            className="w-full"
          />
        </div>
      </div>
      <div className="admin-panel">
        <div className="panel-header">
          <h1>Panel de Gestión de Administradores</h1>
          <div className="header-actions">
            <Button variant="secondary" className="export-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Exportar Informe</span>
            </Button>
            <Button variant="primary" className="add-button">
              <span>+</span>
              <span>Agregar Administrador</span>
            </Button>
          </div>
        </div>

      <div className="panel-content">
        <div className="content-header">
          <h2>Lista de Administradores</h2>
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
          data={filteredAdmins}
          columns={[
            ...columns,
            {
              header: 'Acciones',
              accessor: (admin) => (
                <div className="action-buttons">
                  <button 
                    className="action-button edit"
                    onClick={() => console.log('Editar', admin)}
                    aria-label="Editar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => console.log('Eliminar', admin)}
                    aria-label="Eliminar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )
            }
          ]}
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  );
}