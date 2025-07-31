import { Request, Response, NextFunction } from 'express';
export declare class ValidationMiddleware {
    private logger;
    constructor();
    validateUserRegistration: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateAuthentication: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateProfileUpdate: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateSubAccount: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateAdvisorRegistration: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateClientLinking: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateClientUnlinking: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateGroupTrade: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateAdvisorProfileUpdate: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateTradingOrder: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateStakingAction: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateReferralCode: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateCompetitionEntry: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    validateAdminAction: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
    private handleValidationErrors;
}
//# sourceMappingURL=ValidationMiddleware.d.ts.map