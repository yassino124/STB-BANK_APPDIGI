import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AvancesController } from './avances.controller';
import { AvancesService } from './avances.service';
import { Avance, AvanceSchema } from './schemas/avance.schema';
import { Employee, EmployeeSchema } from '../employees/employee.schema';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Avance.name, schema: AvanceSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [AvancesController],
  providers: [AvancesService],
  exports: [AvancesService],
})
export class AvancesModule {}
