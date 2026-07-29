import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class DeviceTrustGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const deviceTrusted = request.headers['x-device-trusted'];

    if (deviceTrusted !== 'true') {
      throw new ForbiddenException('Device not trusted. Please verify your device.');
    }

    return true;
  }
}
