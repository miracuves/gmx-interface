"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const Logger_1 = require("../utils/Logger");
const ValidationError_1 = require("../utils/ValidationError");
class ErrorHandler {
    static handle(error, req, res, next) {
        this.logger.error('Unhandled error', {
            error: error.message,
            stack: error.stack,
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        if (error instanceof ValidationError_1.ValidationError) {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
            return;
        }
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                error: 'Token expired'
            });
            return;
        }
        if (error.code === '23505') {
            res.status(409).json({
                success: false,
                error: 'Resource already exists'
            });
            return;
        }
        if (error.code === '23503') {
            res.status(400).json({
                success: false,
                error: 'Invalid reference'
            });
            return;
        }
        if (error.code === '42P01') {
            res.status(500).json({
                success: false,
                error: 'Database configuration error'
            });
            return;
        }
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({
            success: false,
            error: message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
    static notFound(req, res, next) {
        this.logger.warn('Route not found', {
            path: req.path,
            method: req.method,
            ip: req.ip
        });
        res.status(404).json({
            success: false,
            error: 'Route not found'
        });
    }
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}
exports.ErrorHandler = ErrorHandler;
ErrorHandler.logger = new Logger_1.Logger();
//# sourceMappingURL=ErrorHandler.js.map