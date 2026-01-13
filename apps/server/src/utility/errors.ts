

export class AppError extends Error {
    constructor(
        public statusCode: number = 500,
        message: string = 'Internal Server Error',
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(400, message, true);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed') {
        super(401, message, true);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(404, message, true);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Conflict') {
        super(409, message, true);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export function getErrorResponse(error: unknown) {
    if (error instanceof AppError) {
        return {
            statusCode: error.statusCode,
            body: {
                success: false,
                error: error.message
            }
        };
    }

    // Log unexpected errors
    // console.error('Unexpected error:', error)

    return {
        statusCode: 500,
        body: {
            success: false,
            error: 'Internal server error'
        }
    };
}
