import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Employee, EmployeeSchema } from '../employees/employee.schema';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { Card, CardSchema } from '../cards/schemas/card.schema';
import { Credit, CreditSchema } from '../credits/schemas/credit.schema';
import { LeaveBalance, LeaveBalanceSchema } from '../leave/schemas/leave.schema';
import { Prime, PrimeSchema } from '../primes/schemas/prime.schema';
import { Payroll, PayrollSchema } from '../payroll/schemas/payroll.schema';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Card.name, schema: CardSchema },
      { name: Credit.name, schema: CreditSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: Prime.name, schema: PrimeSchema },
      { name: Payroll.name, schema: PayrollSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
