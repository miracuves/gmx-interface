import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';
import { ValidationError } from '../utils/ValidationError';

export class ErrorHandler {
  private static logger = new Logger();

  static handle(error: any, req: Request, res: Response, next: NextFunction): void {
    // Log the error
    this.logger.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Handle different types of errors
    if (error instanceof ValidationError) {
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

    if (error.code === '23505') { // PostgreSQL unique constraint violation
      res.status(409).json({
        success: false,
        error: 'Resource already exists'
      });
      return;
    }

    if (error.code === '23503') { // PostgreSQL foreign key constraint violation
      res.status(400).json({
        success: false,
        error: 'Invalid reference'
      });
      return;
    }

    if (error.code === '42P01') { // PostgreSQL undefined table
      res.status(500).json({
        success: false,
        error: 'Database configuration error'
      });
      return;
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';

    res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }

  static notFound(req: Request, res: Response, next: NextFunction): void {
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

  static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
} 