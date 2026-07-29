import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payroll } from './schemas/payroll.schema';
import { Budget } from './schemas/budget.schema';
import { Investment } from './schemas/investment.schema';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payroll.name, schema: Payroll }]),
    MongooseModule.forFeature([{ name: Budget.name, schema: Budget }]),
    MongooseModule.forFeature([{ name: Investment.name, schema: Investment }]),
    EmployeesModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}