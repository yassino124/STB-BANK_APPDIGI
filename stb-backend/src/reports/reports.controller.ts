import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Report } from './schemas/report.schema';

@ApiTags('📑 Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Generate report' })
  create(@Body() data: Partial<Report>) {
    return this.reportsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all reports' })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update report status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.reportsService.updateStatus(id, status);
  }
}
