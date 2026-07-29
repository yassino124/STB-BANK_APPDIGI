import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { MongoServerError } from 'mongodb';
import {
  MongooseError,
} from 'mongoose';

interface ErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

@Catch(MongoError, MongoServerError, MongooseError)
export class MongooseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongooseExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    if (exception?.code === 11000) {
      statusCode = HttpStatus.CONFLICT;
      const keyPattern = exception.keyPattern || {};
      const keys = Object.keys(keyPattern).join(', ');
      message = `Duplicate value for field(s): ${keys}`;
    } else if (exception?.name === 'ValidationError') {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception?.name === 'CastError') {
      statusCode = HttpStatus.BAD_REQUEST;
      message = `Invalid ${exception.path}: ${exception.value}`;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      statusCode,
      message,
      error: exception?.name || 'MongooseError',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(`[DB ${statusCode}] ${request.url} -> ${message}`);

    response.status(statusCode).json(errorResponse);
  }
}
