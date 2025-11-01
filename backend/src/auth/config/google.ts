import dotenv from 'dotenv';

// Asegura que .env raíz esté cargado (config.ts ya lo hace, pero este archivo puede usarse aislado)
dotenv.config();

export const GOOGLE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
};

export const isGoogleAuthConfigured = () => !!(GOOGLE_CONFIG.clientId);

export type GoogleProfile = {
  sub: string; // Google user id
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};
