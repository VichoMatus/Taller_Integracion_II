import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CONFIG, GoogleProfile } from '../config/google';

export class GoogleAuthService {
  private client: OAuth2Client | null = null;

  constructor() {
    if (GOOGLE_CONFIG.clientId) {
      this.client = new OAuth2Client(
        GOOGLE_CONFIG.clientId,
        GOOGLE_CONFIG.clientSecret || undefined,
        GOOGLE_CONFIG.redirectUri || undefined
      );
    }
  }

  isReady(): boolean {
    return !!this.client;
  }

  /**
   * Verifica un ID Token emitido por Google Identity Services (One Tap / button)
   * y retorna el perfil básico del usuario.
   */
  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    if (!this.client) throw new Error('GoogleAuth no configurado: falta GOOGLE_CLIENT_ID');
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: GOOGLE_CONFIG.clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      throw new Error('ID token inválido');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture,
    };
  }
}
