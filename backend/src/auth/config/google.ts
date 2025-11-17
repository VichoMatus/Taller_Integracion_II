import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el único archivo .env de la raíz
const rootPath = path.resolve(__dirname, '../../../..');
dotenv.config({ path: path.join(rootPath, '.env') });

// Soporta tanto GOOGLE_CLIENT_ID (backend) como NEXT_PUBLIC_GOOGLE_CLIENT_ID (si alguien la define por costumbre del frontend)
const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export const GOOGLE_CONFIG = {
  clientId,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
};

export const isGoogleAuthConfigured = () => !!(GOOGLE_CONFIG.clientId);

if (process.env.NODE_ENV !== 'test') {
  const preview = clientId ? clientId.slice(0, 12) + '…' : '(vacío)';

  console.log('GoogleAuth config:', { clientId: preview, hasSecret: !!process.env.GOOGLE_CLIENT_SECRET });
}

export type GoogleProfile = {
  sub: string; // Google user id
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};
