import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Credits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a credit for logged-in employee' })
  create(@Request() req, @Body() dto: any) {
    return this.creditsService.create(req.user.sub, dto);
  }

  @Post('employee/:employeeId')
  @ApiOperation({ summary: 'Create a credit for any employee (RH only)' })
  createForEmployee(@Param('employeeId') employeeId: string, @Body() dto: any) {
    return this.creditsService.create(employeeId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'My credits' })
  getMine(@Request() req) {
    return this.creditsService.getMyCredits(req.user.sub);
  }

  @Get('all')
  @ApiOperation({ summary: 'All credits (RH)' })
  getAll() {
    return this.creditsService.getAllCredits();
  }

  @Post('process-monthly')
  @ApiOperation({ summary: 'Trigger monthly credit deductions (cron or manual RH)' })
  processMonthly() {
    return this.creditsService.processMonthlyCreditDeductions();
  }

  @Post('process-penalties')
  @ApiOperation({ summary: 'Apply penalties to late credits (cron or manual RH)' })
  processPenalties() {
    return this.creditsService.processLatePaymentPenalties();
  }

  @Post(':id/retry-late-payment')
  @ApiOperation({ summary: 'Retry payment for a late credit' })
  retryLatePayment(@Param('id') id: string) {
    return this.creditsService.retryLatePayment(id);
  }

  @Get(':id/early-repayment-calculation')
  @ApiOperation({ summary: 'Calculate early repayment amount and savings' })
  calculateEarlyRepayment(@Param('id') id: string) {
    return this.creditsService.calculateEarlyRepayment(id);
  }

  @Post(':id/early-repayment')
  @ApiOperation({ summary: 'Perform early repayment of credit' })
  performEarlyRepayment(@Param('id') id: string) {
    return this.creditsService.performEarlyRepayment(id);
  }

  @Get(':id/amortization-table')
  @ApiOperation({ summary: 'Get amortization table for credit' })
  getAmortizationTable(@Param('id') id: string) {
    return this.creditsService.generateAmortizationTable(id);
  }

  @Get(':id/payment-history')
  @ApiOperation({ summary: 'Get payment history for credit' })
  getPaymentHistory(@Param('id') id: string) {
    return this.creditsService.getPaymentHistory(id);
  }
}
