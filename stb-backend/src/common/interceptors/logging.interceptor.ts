import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = req;
    const userAgent = headers['user-agent'] || 'unknown';
    const userId = req.user?._id || req.user?.sub || 'anonymous';

    this.logger.log(`Incoming Request: ${method} ${url} | User: ${userId} | IP: ${ip} | UA: ${userAgent}`);

    const now = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(`Response: ${method} ${url} | Status: ${context.switchToHttp().getResponse().statusCode} | Time: ${responseTime}ms`);
        },
        error: (error) => {
          this.logger.error(`Error: ${method} ${url} | Status: ${error.status || 500} | Message: ${error.message}`);
        },
      }),
    );
  }
}
