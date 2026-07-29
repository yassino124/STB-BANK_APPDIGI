import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { Request, RequestSchema } from './schemas/request.schema';
import { Employee, EmployeeSchema } from '../employees/employee.schema';
import { RealtimeModule } from '../realtime/realtime.module';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
    RealtimeModule,
    NotificationsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
