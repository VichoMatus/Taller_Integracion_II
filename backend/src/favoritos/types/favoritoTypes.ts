// src/favorito/type/favoritoTypes.ts

export interface Favorito {
  id_favorito: number | string;
  id_usuario: number | string;
  id_cancha: number | string;
  fecha_creacion: string;       // ISO
  fecha_actualizacion: string;  // ISO
}

export interface FavoritoCreateRequest {
  id_usuario: number | string;
  id_cancha: number | string;
}

export interface FavoritoListQuery {
  id_usuario?: number | string; // normalmente requerido
  id_cancha?: number | string;  // filtrado opcional
  page?: number;
  size?: number;
}

export interface EsFavoritoResponse {
  id_usuario: number | string;
  id_cancha: number | string;
  es_favorito: boolean;
}

export interface CountResponse {
  id_usuario: number | string;
  total: number;
}
