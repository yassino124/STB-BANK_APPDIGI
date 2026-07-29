import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AmicaleController } from './amicale.controller';
import { AmicaleService } from './amicale.service';
import { AmicaleOffer, AmicaleOfferSchema } from './amicale.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AmicaleOffer.name, schema: AmicaleOfferSchema }])],
  controllers: [AmicaleController],
  providers: [AmicaleService],
})
export class AmicaleModule {}
