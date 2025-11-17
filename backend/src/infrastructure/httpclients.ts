
//axios con retries, timeouts, headers
import axiosRetry from "axios-retry";
import { buildHttpClient } from "../infra/http/client";

// Crear cliente reutilizable con /api/v1 incluido
export const http = buildHttpClient(process.env.API_BASE_URL || process.env.UPSTREAM_API_BASE_URL || "http://api-h1d7oi-6fc869-168-232-167-73.traefik.me", () => undefined);

// Añadir retry behavior al cliente
axiosRetry(http, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (err) =>
    axiosRetry.isNetworkOrIdempotentRequestError(err) || err.code === "ECONNABORTED",
});
