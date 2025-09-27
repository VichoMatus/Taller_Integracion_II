/**
 * CONFIGURACIÓN DE AXIOS PARA EL FRONTEND
 * ======================================
 * 
 * Configuración centralizada para todas las llamadas API
 */

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

// Instancia de axios apuntando a la API real
export const apiBackend = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Si necesitas interceptores, agrégalos aquí (opcional)

export default apiBackend;
