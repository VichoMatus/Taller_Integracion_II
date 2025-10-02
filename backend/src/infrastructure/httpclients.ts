
//axios con retries, timeouts, headers
import axios from "axios";
import axiosRetry from "axios-retry";

export const http = axios.create({
  baseURL: process.env.UPSTREAM_API_BASE_URL || "http://api-h1d7oi-6fc869-168-232-167-73.traefik.me", // ej. http://api.sports.local
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

axiosRetry(http, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (err) =>
    axiosRetry.isNetworkOrIdempotentRequestError(err) || err.code === "ECONNABORTED",
});
