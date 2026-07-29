import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Recharge, RechargeSchema } from './schemas/recharge.schema';
import { RechargesService } from './recharges.service';
import { RechargesController } from './recharges.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Recharge.name, schema: RechargeSchema }])],
  providers: [RechargesService],
  controllers: [RechargesController],
  exports: [RechargesService],
})
export class RechargeModule {}
