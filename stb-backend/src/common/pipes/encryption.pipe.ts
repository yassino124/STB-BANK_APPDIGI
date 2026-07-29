import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EncryptionUtil } from '../utils/encryption.util';

@Injectable()
export class EncryptionPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  transform(value: any, metadata: ArgumentMetadata): any {
    if (typeof value === 'string') {
      try {
        return EncryptionUtil.encrypt(value, this.configService.get<string>('ENCRYPTION_KEY', ''));
      } catch {
        throw new BadRequestException(
          `Failed to encrypt value for ${metadata.data}`,
        );
      }
    }
    return value;
  }
}
