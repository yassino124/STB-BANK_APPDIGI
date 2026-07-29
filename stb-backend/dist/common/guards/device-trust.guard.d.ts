import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class DeviceTrustGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
