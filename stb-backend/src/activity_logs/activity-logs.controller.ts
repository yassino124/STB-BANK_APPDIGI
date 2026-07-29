import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLog } from './schemas/activity-log.schema';

@ApiTags('📋 Activity Logs')
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create activity log' })
  create(@Body() data: Partial<ActivityLog>) {
    return this.activityLogsService.create(data);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get activity logs by employee' })
  findByEmployee(@Param('employeeId') employeeId: string, @Query('limit') limit = 100) {
    return this.activityLogsService.findByEmployee(employeeId, +limit);
  }

  @Get('module/:module')
  @ApiOperation({ summary: 'Get activity logs by module' })
  findByModule(@Param('module') module: string, @Query('limit') limit = 100) {
    return this.activityLogsService.findByModule(module, +limit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent activity logs' })
  findRecent(@Query('limit') limit = 100) {
    return this.activityLogsService.findRecent(+limit);
  }
}
