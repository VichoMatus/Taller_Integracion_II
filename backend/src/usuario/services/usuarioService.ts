import axios from 'axios';
import { LoginRequest, Usuario } from '../types/usuarioTypes';

export class UserService {
    async login(credentials: LoginRequest): Promise<any> {
        // Simulación de llamada a API de autenticación
        const response = await axios.post('http://api-url/usuario/auth/login', credentials);
        return response.data;
    }

    async logout(refresh_token: string): Promise<any> {
        // Simulación de llamada a API de logout
        const response = await axios.post('http://api-url/usuario/auth/logout', { refresh_token });
        return response.data;
    }

    async getUserById(id: number): Promise<{ ok: boolean, data?: Usuario, error?: string }> {
        // Simulación de llamada a API para obtener usuario
        try {
            const response = await axios.get(`http://api-url/usuario/${id}`);
            return { ok: true, data: response.data };
        } catch {
            return { ok: false, error: 'Usuario no encontrado' };
        }
    }

    async updateUser(id: number, updateData: Partial<Usuario>): Promise<any> {
        // Simulación de llamada a API para actualizar usuario
        const response = await axios.patch(`http://api-url/usuario/${id}`, updateData);
        return response.data;
    }

    async getComplejosByUserId(userId: number, params?: any): Promise<any> {
        // Simulación de llamada a API para obtener complejos del usuario
        const response = await axios.get(`http://api-url/usuario/${userId}/complejos`, { params });
        return response.data;
    }

    async getComplejoByIdAndUserId(complejoId: number, userId: number, params?: any): Promise<any> {
        // Simulación de llamada a API para obtener un complejo específico del usuario
        const response = await axios.get(`http://api-url/usuario/${userId}/complejos/${complejoId}`, { params });
        return response.data;
    }

    async getComplejoCanchas(complejoId: number): Promise<any> {
        // Simulación de llamada a API para obtener canchas de un complejo
        const response = await axios.get(`http://api-url/complejos/${complejoId}/canchas`);
        return response.data;
    }
}