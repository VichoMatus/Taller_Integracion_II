import api from "@/config/backend";
import { LoginRequest, LoginResponse, RegisterRequest, MeResponse } from "@/types/auth";


/**
 * Maneja autenticación. Si usas JWT:
 * - Guarda el token en localStorage (o cookie HttpOnly si backend lo maneja)
 * - apiBackend ya puede adjuntar Authorization por interceptor (si lo configuraste)
 */
export const authService = {
  async login(payload: LoginRequest) {
    const data = await api.post<LoginResponse>("/auth/login", payload).then(r => r.data);
    if (data?.token) localStorage.setItem("token", data.token);
    return data;
  },
  async loginGoogle(googleToken: string) {
    const data = await api
      .post<LoginResponse>("/auth/google", { token: googleToken })
      .then(r => r.data);
    if (data?.token) localStorage.setItem("token", data.token);
    return data;
  },
  async register(payload: RegisterRequest) {
    return api.post<LoginResponse>("/auth/register", payload).then(r => r.data);
  },
  async me() {
    return api.get<MeResponse>("/auth/me").then(r => r.data);
  },
  async refresh() {
    return api.post<LoginResponse>("/auth/refresh").then(r => r.data);
  },
  async logout() {
    try {
      await api.post<void>("/auth/logout");
    } finally {
      localStorage.removeItem("token");
    }
  },
};
