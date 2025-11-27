import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      error: 'Validation failed',
      errors,
      message: errors.map((e) => e.message).join(', '),
    });
  }

  // Handle Prisma database constraint errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Check constraint violation (e.g., valid_bp)
    if (err.code === 'P2002') {
      return res.status(400).json({
        error: 'Duplicate entry',
        message: 'A record with this information already exists',
      });
    }
    
    // Foreign key constraint violation
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Invalid reference',
        message: 'The provided reference does not exist',
      });
    }
    
    // Check constraint violation (PostgreSQL check constraints)
    // These come through as P2011 or in the error message
    const errorMessage = err.message || '';
    if (err.code === 'P2011' || errorMessage.includes('check constraint') || errorMessage.includes('violates check constraint')) {
      if (errorMessage.includes('valid_availability_time')) {
        return res.status(400).json({
          error: 'Invalid time range',
          message: 'End time must be after start time. Please ensure the end time is later than the start time.',
        });
      }
    }
  }
  
  // Handle Prisma validation errors (which can wrap constraint violations)
  if (err instanceof Prisma.PrismaClientValidationError) {
    const errorMessage = err.message || '';
    if (errorMessage.includes('valid_availability_time') || errorMessage.includes('violates check constraint')) {
      return res.status(400).json({
        error: 'Invalid time range',
        message: 'End time must be after start time. Please ensure the end time is later than the start time.',
      });
    }
  }

  // Handle database constraint violations (check constraints)
  // These can come from Prisma errors or be wrapped in the error message
  const errorMessage = err.message || '';
  if (errorMessage.includes('check constraint') || errorMessage.includes('violates check constraint')) {
    let message = 'Data validation failed';
    const errors: Array<{ field: string; message: string }> = [];
    
    // Parse constraint name from error message
    if (errorMessage.includes('valid_session_time') || errorMessage.includes('valid_time') || errorMessage.includes('valid_availability_time')) {
      message = 'End time must be after start time. Please ensure the end time is later than the start time.';
      errors.push({ field: 'startTime', message });
      errors.push({ field: 'endTime', message });
    } else if (errorMessage.includes('valid_bp')) {
      message = 'Systolic blood pressure must be greater than diastolic blood pressure';
      errors.push({ field: 'bloodPressureSystolic', message });
      errors.push({ field: 'bloodPressureDiastolic', message });
    } else if (errorMessage.includes('valid_weight')) {
      message = 'Weight must be between 0 and 500 kg';
      errors.push({ field: 'weight', message });
    } else if (errorMessage.includes('valid_height')) {
      message = 'Height must be between 0 and 300 cm';
      errors.push({ field: 'height', message });
    } else if (errorMessage.includes('valid_body_fat')) {
      message = 'Body fat percentage must be between 0 and 100';
      errors.push({ field: 'bodyFatPercentage', message });
    } else if (errorMessage.includes('valid_heart_rate')) {
      message = 'Resting heart rate must be between 30 and 200 bpm';
      errors.push({ field: 'restingHeartRate', message });
    } else {
      errors.push({ field: 'general', message });
    }
    
    return res.status(400).json({
      error: 'Validation failed',
      errors,
      message,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { message: err.message }),
  });
};

