import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { EmployeesModule } from '../employees/employees.module';
// Will import other modules (Primes, Leave) if needed

@Module({
  imports: [EmployeesModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
