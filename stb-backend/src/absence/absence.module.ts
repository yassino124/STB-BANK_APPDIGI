import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Absence, AbsenceSchema } from './schemas/absence.schema';
import { AbsenceService } from './absence.service';
import { AbsenceController } from './absence.controller';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Absence.name, schema: AbsenceSchema }]),
    EmployeesModule,
  ],
  controllers: [AbsenceController],
  providers: [AbsenceService],
  exports: [AbsenceService],
})
export class AbsenceModule {}