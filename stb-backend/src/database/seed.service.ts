import { Injectable } from '@nestjs/common';

@Injectable()
export class SeedService {
  async seedDefaultData() {
    return { success: true };
  }
}
