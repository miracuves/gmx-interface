import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/JWTService';
export declare class AuthMiddleware {
    private jwt;
    private logger;
    constructor(jwt: JWTService);
    authenticate: (req: Request, res: Response, next: NextFunction) => void;
    requireRole: (role: string) => (req: Request, res: Response, next: NextFunction) => void;
    requireAnyRole: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
    optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
    private extractToken;
}
//# sourceMappingURL=AuthMiddleware.d.ts.map