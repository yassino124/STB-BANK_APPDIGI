import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HierarchyController } from './hierarchy.controller';
import { HierarchyService } from './hierarchy.service';
import { Hierarchy, HierarchySchema } from './hierarchy.schema';
import { LeaveRequest, LeaveRequestSchema } from '../leave/schemas/leave.schema';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hierarchy.name, schema: HierarchySchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
    ]),
    EmployeesModule,
  ],
  controllers: [HierarchyController],
  providers: [HierarchyService],
  exports: [HierarchyService],
})
export class HierarchyModule {}