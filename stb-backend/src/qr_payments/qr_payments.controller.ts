import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QrPaymentsService } from './qr-payments.service';
import { QrPayment } from './schemas/qr-payment.schema';

@ApiTags('📱 QR Payments')
@Controller('qr-payments')
export class QrPaymentsController {
  constructor(private readonly qrPaymentsService: QrPaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create QR payment' })
  create(@Body() data: Partial<QrPayment>) {
    return this.qrPaymentsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List QR payments' })
  findByEmployee(@Query('employeeId') employeeId: string, @Query('limit') limit = 50) {
    return this.qrPaymentsService.findByEmployee(employeeId, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get QR payment by ID' })
  findOne(@Param('id') id: string) {
    return this.qrPaymentsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update QR payment status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.qrPaymentsService.updateStatus(id, status);
  }
}
