import jwt from 'jsonwebtoken';
import { Config } from '../config/Config';
import { Logger } from './Logger';

export interface JWTPayload {
  userId: string;
  walletAddress: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class JWTService {
  private logger: Logger;
  private secret: string;
  private expiresIn: string;
  private refreshExpiresIn: string;

  constructor() {
    this.logger = new Logger();
    this.secret = Config.jwt.secret;
    this.expiresIn = Config.jwt.expiresIn;
    this.refreshExpiresIn = Config.jwt.refreshExpiresIn;
  }

  generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      const token = jwt.sign(payload, this.secret, {
        expiresIn: this.expiresIn,
        issuer: 'gmx-backend',
        audience: 'gmx-users'
      });

      this.logger.info('JWT token generated', { 
        userId: payload.userId, 
        walletAddress: payload.walletAddress 
      });

      return token;
    } catch (error: any) {
      this.logger.error('Error generating JWT token', { error: error.message });
      throw new Error('Failed to generate token');
    }
  }

  generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      const token = jwt.sign(payload, this.secret, {
        expiresIn: this.refreshExpiresIn,
        issuer: 'gmx-backend',
        audience: 'gmx-users'
      });

      this.logger.info('JWT refresh token generated', { 
        userId: payload.userId, 
        walletAddress: payload.walletAddress 
      });

      return token;
    } catch (error: any) {
      this.logger.error('Error generating JWT refresh token', { error: error.message });
      throw new Error('Failed to generate refresh token');
    }
  }

  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: 'gmx-backend',
        audience: 'gmx-users'
      }) as JWTPayload;

      this.logger.debug('JWT token verified', { 
        userId: decoded.userId, 
        walletAddress: decoded.walletAddress 
      });

      return decoded;
    } catch (error: any) {
      this.logger.error('Error verifying JWT token', { error: error.message });
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  decodeToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return decoded;
    } catch (error: any) {
      this.logger.error('Error decoding JWT token', { error: error.message });
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error: any) {
      this.logger.error('Error checking token expiration', { error: error.message });
      return true;
    }
  }

  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return null;
      }

      return new Date(decoded.exp * 1000);
    } catch (error: any) {
      this.logger.error('Error getting token expiration', { error: error.message });
      return null;
    }
  }

  refreshToken(refreshToken: string): string {
    try {
      const decoded = this.verifyToken(refreshToken);
      
      // Generate new access token
      const newToken = this.generateToken({
        userId: decoded.userId,
        walletAddress: decoded.walletAddress,
        role: decoded.role
      });

      this.logger.info('JWT token refreshed', { 
        userId: decoded.userId, 
        walletAddress: decoded.walletAddress 
      });

      return newToken;
    } catch (error: any) {
      this.logger.error('Error refreshing JWT token', { error: error.message });
      throw new Error('Failed to refresh token');
    }
  }

  generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    try {
      const accessToken = this.generateToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      // Calculate expiration time
      const expiresIn = this.getExpirationTime(this.expiresIn);

      this.logger.info('JWT tokens generated', { 
        userId: payload.userId, 
        walletAddress: payload.walletAddress 
      });

      return {
        accessToken,
        refreshToken,
        expiresIn
      };
    } catch (error: any) {
      this.logger.error('Error generating JWT tokens', { error: error.message });
      throw new Error('Failed to generate tokens');
    }
  }

  private getExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // Default to 1 hour
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }
} 