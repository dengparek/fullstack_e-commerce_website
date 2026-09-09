export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Only assign code if it was explicitly provided
    if (code !== undefined) {
      this.code = code;
    }

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code?: string): AppError {
    return new AppError(message, 400, code);
  }

  static unauthorized(
    message = "Authentication required",
    code?: string,
  ): AppError {
    return new AppError(message, 401, code);
  }

  static forbidden(message = "Access denied", code?: string): AppError {
    return new AppError(message, 403, code);
  }

  static notFound(message = "Resource not found", code?: string): AppError {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code?: string): AppError {
    return new AppError(message, 409, code);
  }

  static internal(message = "Internal server error"): AppError {
    return new AppError(message, 500);
  }
}
