import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class EncryptionPipe implements PipeTransform {
    private configService;
    constructor(configService: ConfigService);
    transform(value: any, metadata: ArgumentMetadata): any;
}
