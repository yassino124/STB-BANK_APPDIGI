import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RiskAlertsService } from './risk-alerts.service';
import { RiskAlert } from './schemas/risk-alert.schema';

@ApiTags('⚠️ Risk Alerts')
@Controller('risk-alerts')
export class RiskAlertsController {
  constructor(private readonly riskAlertsService: RiskAlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Create risk alert' })
  create(@Body() data: Partial<RiskAlert>) {
    return this.riskAlertsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List risk alerts' })
  findByEmployee(@Query('employeeId') employeeId: string) {
    return this.riskAlertsService.findByEmployee(employeeId);
  }

  @Get('open')
  @ApiOperation({ summary: 'List open risk alerts' })
  findOpen() {
    return this.riskAlertsService.findOpen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get risk alert by ID' })
  findOne(@Param('id') id: string) {
    return this.riskAlertsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update risk alert status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Body('resolvedBy') resolvedBy?: string) {
    return this.riskAlertsService.updateStatus(id, status, resolvedBy);
  }
}
