import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { Response } from 'express';

@Catch(
    Prisma.PrismaClientKnownRequestError,
    Prisma.PrismaClientValidationError,
    Prisma.PrismaClientUnknownRequestError
)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(
        exception:
            | Prisma.PrismaClientKnownRequestError
            | Prisma.PrismaClientValidationError
            | Prisma.PrismaClientUnknownRequestError,
        host: ArgumentsHost
    ) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof Prisma.PrismaClientValidationError) {
            status = HttpStatus.BAD_REQUEST;

            const errorMessage = exception.message;

            const missingFieldMatch = errorMessage.match(/Argument `(\w+)` is missing/);
            const invalidTypeMatch = errorMessage.match(/Argument `(\w+)`.*got.*instead/);

            if (missingFieldMatch) {
                message = `Required field '${missingFieldMatch[1]}' is missing`;
            } else if (invalidTypeMatch) {
                message = `Invalid type for field '${invalidTypeMatch[1]}'`;
            } else {
                message = 'Invalid data provided';
            }
        }
        else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002':
                    status = HttpStatus.CONFLICT;
                    message = `Unique constraint failed on field: ${exception.meta?.target}`;
                    break;
                case 'P2025':
                    status = HttpStatus.NOT_FOUND;
                    message = 'Record not found';
                    break;
                case 'P2003':
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Foreign key constraint failed';
                    break;
                case 'P2011':
                    status = HttpStatus.BAD_REQUEST;
                    message = `Null constraint violation on field: ${exception.meta?.target}`;
                    break;
                case 'P2014':
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Required relation violation';
                    break;
                default:
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Database error occurred';
            }
        }
        else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Unknown database error occurred';
        }

        response.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        });
    }
}