import { Request, Response, NextFunction } from 'express';
export declare class ErrorHandler {
    private static logger;
    static handle(error: any, req: Request, res: Response, next: NextFunction): void;
    static notFound(req: Request, res: Response, next: NextFunction): void;
    static asyncHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=ErrorHandler.d.ts.map