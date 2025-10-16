'use client';

import React, { useState, useEffect } from 'react';
import AdminsLayout from '@/components/layout/AdminsLayout';
import { useSuperAdminProtection } from '@/hooks/useSuperAdminProtection';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔥 ESTADO PARA VERIFICAR SI ESTÁ MONTADO EN EL CLIENTE
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState('Superadministrador');
  const [userRole, setUserRole] = useState<'admin' | 'superadmin'>('superadmin');
  
  // 🔥 PRIMER useEffect: SOLO MARCAR COMO MONTADO
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 SEGUNDO useEffect: CARGAR DATOS DEL USUARIO (SOLO CUANDO ESTÁ MONTADO)
  useEffect(() => {
    if (!mounted) return; // NO EJECUTAR HASTA QUE ESTÉ MONTADO

    try {
      // Cargar nombre de usuario
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.nombre) {
        setUserName(userData.nombre);
      }

      // Cargar rol de usuario
      const storedRole = localStorage.getItem('user_role');
      const mappedRole = (storedRole === 'super_admin' ? 'superadmin' : storedRole) || 'superadmin';
      setUserRole(mappedRole as 'admin' | 'superadmin');
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      // Usar valores por defecto
      setUserName('Superadministrador');
      setUserRole('superadmin');
    }
  }, [mounted]);

  // 🔥 USAR EL HOOK DE PROTECCIÓN SOLO CUANDO ESTÁ MONTADO
  const isProtected = mounted ? useSuperAdminProtection() : false;

  // 🔥 LOADING HASTA QUE ESTÉ MONTADO
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