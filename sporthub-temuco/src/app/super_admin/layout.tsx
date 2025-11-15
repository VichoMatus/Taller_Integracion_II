'use client';

import React, { useState, useEffect } from 'react';
import AdminsLayout from '@/components/layout/AdminsLayout';
import { useSuperAdminProtection } from '@/hooks/useSuperAdminProtection';
// Importar estilos base del admin primero
import '@/app/admin/dashboard.css';
// Luego estilos específicos de super_admin (sobrescriben si es necesario)
import './dashboard.css';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState('Superadministrador');
  const [userRole, setUserRole] = useState<'admin' | 'super_admin'>('super_admin');
  
  // 🔥 CORREGIDO: Llamar el hook de protección SIN condición
  useSuperAdminProtection();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.nombre) {
        setUserName(userData.nombre);
      }

      const storedRole = localStorage.getItem('user_role');
      // 🔥 CORREGIDO: Manejar tanto 'super_admin' como 'super_admin'
      const mappedRole = storedRole === 'super_admin' ? 'super_admin' : (storedRole || 'super_admin');
      setUserRole(mappedRole as 'admin' | 'super_admin');
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      setUserName('Superadministrador');
      setUserRole('super_admin');
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          Cargando panel de administración...
        </div>
      </div>
    );
  }

  return (
    <AdminsLayout 
      userRole={userRole}
      userName={userName}
      notificationCount={3}
    >
      {children}
    </AdminsLayout>
  );
}