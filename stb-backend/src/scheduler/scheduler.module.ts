import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { Employee, EmployeeSchema } from '../employees/employee.schema';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { PayrollModule } from '../payroll/payroll.module';
import { CreditsModule } from '../credits/credits.module';
import { LeaveModule } from '../leave/leave.module';
import { CongesModule } from '../requests/conges.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
    ScheduleModule.forRoot(),
    PayrollModule,
    CreditsModule,
    LeaveModule,
    CongesModule,
    DocumentsModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
