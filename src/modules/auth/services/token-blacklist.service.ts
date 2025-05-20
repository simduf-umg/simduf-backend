import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens: Map<string, number> = new Map();
  
  constructor(private configService: ConfigService) {
    // Limpiar tokens expirados cada hora
    setInterval(() => this.cleanupExpiredTokens(), 60 * 60 * 1000);
  }

  /**
   * Añade un token a la lista negra
   * @param token Token JWT a invalidar
   * @param expiry Timestamp de expiración del token
   */
  blacklistToken(token: string, expiry: number): void {
    if (token) {
      this.blacklistedTokens.set(token, expiry);
    }
  }

  /**
   * Verifica si un token está en la lista negra
   * @param token Token JWT a verificar
   * @returns true si el token está en la lista negra
   */
  isBlacklisted(token: string | null): boolean {
    if (!token) return false;
    return this.blacklistedTokens.has(token);
  }

  /**
   * Elimina tokens expirados de la lista negra
   */
  private cleanupExpiredTokens(): void {
    const now = Math.floor(Date.now() / 1000);
    
    for (const [token, expiry] of this.blacklistedTokens.entries()) {
      if (expiry < now) {
        this.blacklistedTokens.delete(token);
      }
    }
  }
}