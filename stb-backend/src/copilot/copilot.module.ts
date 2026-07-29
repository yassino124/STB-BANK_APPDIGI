import { Module } from '@nestjs/common';
import { CopilotService } from './copilot.service';
import { CopilotController } from './copilot.controller';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [EmployeesModule],
  providers: [CopilotService],
  controllers: [CopilotController],
  exports: [CopilotService],
})
export class CopilotModule {}
