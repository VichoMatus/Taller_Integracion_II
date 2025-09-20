// types/Admin.ts
export interface Admin {
  id: string;
  nombre: string;
  email: string;
  estado: 'Activo' | 'Inactivo' | 'Pendiente';
  fechaRegistro: string;
}

export interface Court {
  id: string;
  nombre: string;
  ubicacion: string;
  estado: 'Activo' | 'Inactivo' | 'Por revisar';
  tipo: string;
}