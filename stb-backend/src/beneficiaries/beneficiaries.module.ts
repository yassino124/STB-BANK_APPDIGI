import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Beneficiary, BeneficiarySchema } from './schemas/beneficiary.schema';
import { BeneficiariesService } from './beneficiaries.service';
import { BeneficiariesController } from './beneficiaries.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Beneficiary.name, schema: BeneficiarySchema }])],
  providers: [BeneficiariesService],
  controllers: [BeneficiariesController],
  exports: [BeneficiariesService],
})
export class BeneficiariesModule {}
