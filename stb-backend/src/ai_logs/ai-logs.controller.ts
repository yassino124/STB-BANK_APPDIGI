import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiLogsService } from './ai-logs.service';
import { AiLog } from './schemas/ai-log.schema';

@ApiTags('🤖 AI Logs')
@Controller('ai-logs')
export class AiLogsController {
  constructor(private readonly aiLogsService: AiLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create AI log' })
  create(@Body() data: Partial<AiLog>) {
    return this.aiLogsService.create(data);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get AI logs by session' })
  findBySession(@Param('sessionId') sessionId: string) {
    return this.aiLogsService.findBySession(sessionId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get AI logs by employee' })
  findByEmployee(@Param('employeeId') employeeId: string, @Query('limit') limit = 100) {
    return this.aiLogsService.findByEmployee(employeeId, +limit);
  }

  @Get('stats/:employeeId')
  @ApiOperation({ summary: 'Get AI usage stats' })
  getStats(@Param('employeeId') employeeId: string) {
    return this.aiLogsService.findStats(employeeId);
  }
}
