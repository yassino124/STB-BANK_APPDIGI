import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrimesService } from './primes.service';
import { PrimesController } from './primes.controller';
import { Prime, PrimeSchema } from './schemas/prime.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Prime.name, schema: PrimeSchema }]),
    NotificationsModule,
  ],
  controllers: [PrimesController],
  providers: [PrimesService],
  exports: [PrimesService],
})
export class PrimesModule {}
