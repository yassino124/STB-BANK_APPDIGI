import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';
import { Credit, CreditSchema, CreditPayment, CreditPaymentSchema } from './schemas/credit.schema';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { Employee, EmployeeSchema } from '../employees/employee.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Credit.name, schema: CreditSchema },
      { name: CreditPayment.name, schema: CreditPaymentSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [CreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
