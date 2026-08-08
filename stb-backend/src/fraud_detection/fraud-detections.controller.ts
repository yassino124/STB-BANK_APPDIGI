import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FraudDetectionsService } from './fraud-detections.service';
import { FraudDetection } from './schemas/fraud-detection.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

const SECURITY_ROLES = [Role.IT, Role.ADMIN, Role.SUPER_ADMIN, Role.RH, Role.FINANCE, Role.MANAGER];

@ApiTags('🛡️ Fraud Detection')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fraud-detections')
export class FraudDetectionsController {
  constructor(private readonly fraudDetectionsService: FraudDetectionsService) {}

  @Post()
  @Roles(Role.IT, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Create fraud detection record' })
  create(@Body() data: Partial<FraudDetection>) {
    return this.fraudDetectionsService.create(data);
  }

  @Get()
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: '📋 List all fraud detections (populated with employee info)' })
  findAll(@Query('limit') limit = 50) {
    return this.fraudDetectionsService.findAll(+limit);
  }

  @Get('summary')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: '📊 Get fraud detection summary stats' })
  getSummary() {
    return this.fraudDetectionsService.getSummary();
  }

  @Get('monthly')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: '📈 Monthly fraud stats for Direction dashboard' })
  getMonthlyStats(@Query('months') months = 6) {
    return this.fraudDetectionsService.getMonthlyStats(+months);
  }

  @Get('by-type')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: '📊 Fraud count by type' })
  getByType() {
    return this.fraudDetectionsService.getByType();
  }

  @Get('high-risk')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: '🔴 List high risk detections' })
  findHighRisk(@Query('threshold') threshold = 70) {
    return this.fraudDetectionsService.findHighRisk(+threshold);
  }

  @Get('employee/:employeeId')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: 'Get fraud detections for specific employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.fraudDetectionsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: 'Get fraud detection by ID' })
  findOne(@Param('id') id: string) {
    return this.fraudDetectionsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(...SECURITY_ROLES)
  @ApiOperation({ summary: 'Update fraud detection status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('assignedTo') assignedTo?: string,
  ) {
    return this.fraudDetectionsService.updateStatus(id, status, assignedTo);
  }
}
