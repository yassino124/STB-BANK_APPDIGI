import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from './employee.schema';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { AccountsModule } from '../accounts/accounts.module';
import { ActivityLogsModule } from '../activity_logs/activity_logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Employee.name, schema: EmployeeSchema }]),
    forwardRef(() => AccountsModule),
    ActivityLogsModule,
  ],
  providers: [EmployeesService],
  controllers: [EmployeesController],
  exports: [EmployeesService, MongooseModule],
})
export class EmployeesModule {}
