import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/JWTService';
import { Logger } from '../utils/Logger';

export class AuthMiddleware {
  private logger: Logger;

  constructor(private jwt: JWTService) {
    this.logger = new Logger();
  }

  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        this.logger.warn('No token provided', { ip: req.ip, userAgent: req.get('User-Agent') });
        res.status(401).json({
          success: false,
          error: 'No token provided'
        });
        return;
      }

      const decoded = this.jwt.verifyToken(token);
      (req as any).user = decoded;
      
      this.logger.info('User authenticated', { 
        userId: decoded.userId, 
        walletAddress: decoded.walletAddress,
        ip: req.ip 
      });
      
      next();
    } catch (error: any) {
      this.logger.error('Authentication failed', { 
        error: error.message, 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  };

  requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const user = (req as any).user;
        
        if (!user) {
          res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
          return;
        }

        if (user.role !== role) {
          this.logger.warn('Insufficient permissions', { 
            userId: user.userId, 
            requiredRole: role, 
            userRole: user.role 
          });
          
          res.status(403).json({
            success: false,
            error: 'Insufficient permissions'
          });
          return;
        }

        next();
      } catch (error: any) {
        this.logger.error('Role verification failed', { error: error.message });
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    };
  };

  requireAnyRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const user = (req as any).user;
        
        if (!user) {
          res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
          return;
        }

        if (!roles.includes(user.role)) {
          this.logger.warn('Insufficient permissions', { 
            userId: user.userId, 
            requiredRoles: roles, 
            userRole: user.role 
          });
          
          res.status(403).json({
            success: false,
            error: 'Insufficient permissions'
          });
          return;
        }

        next();
      } catch (error: any) {
        this.logger.error('Role verification failed', { error: error.message });
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    };
  };

  optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        const decoded = this.jwt.verifyToken(token);
        (req as any).user = decoded;
        this.logger.info('Optional authentication successful', { 
          userId: decoded.userId, 
          walletAddress: decoded.walletAddress 
        });
      }

      next();
    } catch (error: any) {
      // For optional auth, we don't fail the request
      this.logger.debug('Optional authentication failed', { error: error.message });
      next();
    }
  };

  private extractToken(req: Request): string | null {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check query parameter
    const queryToken = req.query.token as string;
    if (queryToken) {
      return queryToken;
    }

    // Check cookie
    const cookieToken = req.cookies?.token;
    if (cookieToken) {
      return cookieToken;
    }

    return null;
  }
} 