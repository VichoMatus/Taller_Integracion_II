// Login con credenciales normales
export interface LoginRequest {
  email: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id_usuario: number | string;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
}

// Registro
export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  telefono?: string | null;
}

// Datos del usuario autenticado (me)
export interface MeResponse {
  id_usuario: number | string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  esta_activo: boolean;
  verificado: boolean;
  avatar_url?: string | null;
}
