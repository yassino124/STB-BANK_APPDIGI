import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bill, BillSchema } from './schemas/bill.schema';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Bill.name, schema: BillSchema }])],
  providers: [BillsService],
  controllers: [BillsController],
  exports: [BillsService],
})
export class BillsModule {}
