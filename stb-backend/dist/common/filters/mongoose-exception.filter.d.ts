import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class MongooseExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: any, host: ArgumentsHost): void;
}
