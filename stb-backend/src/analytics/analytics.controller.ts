import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './schemas/analytics.schema';

@ApiTags('📊 Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  @ApiOperation({ summary: 'Create analytics record' })
  create(@Body() data: Partial<Analytics>) {
    return this.analyticsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all analytics' })
  findAll(@Query('period') period?: string, @Query('metric') metric?: string) {
    return this.analyticsService.findAll(period, metric);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get analytics by employee' })
  findByEmployee(@Param('employeeId') employeeId: string, @Query('metric') metric?: string) {
    return this.analyticsService.findByEmployee(employeeId, metric);
  }

  @Get('aggregates')
  @ApiOperation({ summary: 'Get analytics aggregates' })
  findAggregates(@Query('metric') metric: string, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.analyticsService.findAggregates(metric, new Date(startDate), new Date(endDate));
  }
}
