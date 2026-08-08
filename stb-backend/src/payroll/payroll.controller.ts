import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get my payroll history' })
  getMyPayrolls(@Request() req) {
    return this.payrollService.getMyPayrolls(req.user.sub);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all payrolls (RH)' })
  getAll(@Query('mois') mois: string, @Query('annee') annee: string) {
    return this.payrollService.getAllPayrolls(mois ? +mois : undefined, annee ? +annee : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll detail' })
  getById(@Param('id') id: string) {
    return this.payrollService.getPayrollById(id);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate payroll for a month (RH Admin)' })
  generate(@Body() body: { mois: number; annee: number }) {
    return this.payrollService.generateMonthlyPayroll(body.mois, body.annee);
  }

  @Post('credit-salaries')
  @ApiOperation({ summary: 'Credit monthly salaries to employees accounts (RH Admin)' })
  creditSalaries() {
    return this.payrollService.creditMonthlySalaries();
  }

  @Post('credit-salary/:employeeId')
  @ApiOperation({ summary: 'Credit monthly salary for a specific employee (Finance/Admin). Use force=true to bypass month lock (testing).' })
  creditSalaryForEmployee(
    @Param('employeeId') employeeId: string,
    @Body() body: { force?: boolean },
  ) {
    return this.payrollService.creditMonthlySalaries(employeeId, body?.force);
  }
}
