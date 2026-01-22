/**
 * Express middleware utilities
 */
import { Request, Response, NextFunction } from 'express';
import { AppError, getErrorResponse } from './errors.js';

/**
 * Wrapper for async route handlers to catch errors
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Global error handling middleware
 */
export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
    const { statusCode, body } = getErrorResponse(err);
    res.status(statusCode).json(body);
}

/**
 * 404 middleware
 */
export function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
}
