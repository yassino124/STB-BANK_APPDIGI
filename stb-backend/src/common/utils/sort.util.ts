import { SortDto } from '../dto/sort.dto';

export class SortUtil {
  static buildSort(sortDto?: SortDto): Record<string, 1 | -1> {
    if (!sortDto || !sortDto.sortBy) {
      return { createdAt: -1 };
    }

    const sortOrder = sortDto.sortOrder === 'asc' ? 1 : -1;
    return { [sortDto.sortBy]: sortOrder };
  }
}
