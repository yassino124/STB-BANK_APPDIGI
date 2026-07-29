import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FraudDetectionsService } from './fraud-detections.service';
import { FraudDetection } from './schemas/fraud-detection.schema';

@ApiTags('🛡️ Fraud Detection')
@Controller('fraud-detections')
export class FraudDetectionsController {
  constructor(private readonly fraudDetectionsService: FraudDetectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create fraud detection' })
  create(@Body() data: Partial<FraudDetection>) {
    return this.fraudDetectionsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List fraud detections' })
  findByEmployee(@Query('employeeId') employeeId: string) {
    return this.fraudDetectionsService.findByEmployee(employeeId);
  }

  @Get('high-risk')
  @ApiOperation({ summary: 'List high risk detections' })
  findHighRisk(@Query('threshold') threshold = 70) {
    return this.fraudDetectionsService.findHighRisk(+threshold);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fraud detection by ID' })
  findOne(@Param('id') id: string) {
    return this.fraudDetectionsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update fraud detection status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Body('assignedTo') assignedTo?: string) {
    return this.fraudDetectionsService.updateStatus(id, status, assignedTo);
  }
}
