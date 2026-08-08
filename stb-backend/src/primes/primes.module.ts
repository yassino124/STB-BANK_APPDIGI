import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrimesService } from './primes.service';
import { PrimesController } from './primes.controller';
import { Prime, PrimeSchema } from './schemas/prime.schema';
import { Employee, EmployeeSchema } from '../employees/employee.schema';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prime.name, schema: PrimeSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [PrimesController],
  providers: [PrimesService],
  exports: [PrimesService],
})
export class PrimesModule {}
