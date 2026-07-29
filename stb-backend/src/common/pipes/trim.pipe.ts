import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('Validation failed');
    }
    return value.trim();
  }
}
