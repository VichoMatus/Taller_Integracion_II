// src/types/common.ts
export interface ApiError {
  status?: number;
  message: string;
  cause?: unknown;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
