import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChequesController } from './cheques.controller';
import { ChequesService } from './cheques.service';
import { ChequeRequest, ChequeRequestSchema } from './cheques.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ChequeRequest.name, schema: ChequeRequestSchema }])],
  controllers: [ChequesController],
  providers: [ChequesService],
})
export class ChequesModule {}
