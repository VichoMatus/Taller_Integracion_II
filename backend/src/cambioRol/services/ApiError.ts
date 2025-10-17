// src/services/http/handleApiError.ts
import { ApiError } from "../types/common";

export function handleApiError(e: any): never {
  const status = e?.response?.status;
  const message =
    e?.response?.data?.error ||
    e?.response?.data?.message ||
    e?.message ||
    "Error de red";
  const err: ApiError = { status, message, cause: e };
  throw err;
}
