import { PipeTransform } from '@nestjs/common';
export declare class TrimPipe implements PipeTransform {
    transform(value: string): string;
}
