import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiskAlertsService } from './risk-alerts.service';
import { RiskAlert } from './schemas/risk-alert.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

const SECURITY_ROLES = [Role.IT, Role.ADMIN, Role.SUPER_ADMIN, Role.RH, Role.FINANCE, Role.MANAGER];

@ApiTags('⚠️ Risk Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('risk-alerts')
export class RiskAlertsController {
  constructor(private readonly riskAlertsService: RiskAlertsService) {}

  @Post()
  @Roles(Role.IT, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Create risk alert' })
  create(@Body() data: Partial<RiskAlert>) {
    return this.riskAlertsService.create(data);
  }

  @Get()
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: '📋 List all risk alerts (populated with employee info)' })
  findAll(@Query('limit') limit = 50) {
    return this.riskAlertsService.findAll(+limit);
  }

  @Get('summary')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: '📊 Get risk alert summary stats' })
  getSummary() {
    return this.riskAlertsService.getSummary();
  }

  @Get('monthly')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: '📈 Monthly risk stats for Direction dashboard' })
  getMonthlyStats(@Query('months') months = 6) {
    return this.riskAlertsService.getMonthlyStats(+months);
  }

  @Get('open')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: '🔴 List open risk alerts' })
  findOpen() {
    return this.riskAlertsService.findOpen();
  }

  @Get('employee/:employeeId')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: 'Get risk alerts for specific employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.riskAlertsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: 'Get risk alert by ID' })
  findOne(@Param('id') id: string) {
    return this.riskAlertsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: 'Update risk alert status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('resolvedBy') resolvedBy?: string,
  ) {
    return this.riskAlertsService.updateStatus(id, status, resolvedBy);
  }
}
