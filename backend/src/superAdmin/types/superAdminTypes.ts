// Tipos básicos para el módulo SuperAdmin - Versión simplificada

// Autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserPublic;
}

// Usuario
export interface UserPublic {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  avatar?: string;
  rol: 'usuario' | 'dueno' | 'admin' | 'superadmin';
  activo: boolean;
  verificado: boolean;
  fecha_creacion: string;
}

// Queries básicas
export interface BaseQuery {
  page?: number;
  page_size?: number;
}

// Respuesta genérica
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  message?: string;
  error?: string;
}