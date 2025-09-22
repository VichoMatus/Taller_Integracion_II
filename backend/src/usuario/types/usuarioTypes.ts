export interface LoginRequest {
    email: string;
    password: string;
}

export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    rol: string;
    activo: boolean;
    fechaRegistro: string | null;
    // Puedes agregar más campos según lo que requiera el frontend
    // avatar?: string | null;
}