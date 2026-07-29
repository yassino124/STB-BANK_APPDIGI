import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CongesController } from './conges.controller';
import { CongesService } from './conges.service';
import { Conge, CongeSchema } from './schemas/conge.schema';
import { Employee, EmployeeSchema } from '../employees/employee.schema';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conge.name, schema: CongeSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [CongesController],
  providers: [CongesService],
  exports: [CongesService],
})
export class CongesModule {}
