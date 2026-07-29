import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { PayrollStatus } from './schemas/payroll.schema';
import { BudgetStatus } from './schemas/budget.schema';
import { InvestmentStatus } from './schemas/investment.schema';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Finance Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ── Payroll ──────────────────────────────────────────────────

  @Post('payroll')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Create payroll entry' })
  createPayroll(@Request() req, @Body() dto: any) {
    return this.financeService.createPayroll(dto);
  }

  @Get('payroll')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Get all payrolls' })
  getPayrolls(
    @Request() req,
    @Query('employeeId') employeeId?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.financeService.getPayrolls(employeeId, month, year);
  }

  @Get('payroll/:id')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Get payroll by ID' })
  getPayrollById(@Param('id') id: string) {
    return this.financeService.getPayrollById(id);
  }

  @Patch('payroll/:id/status')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Update payroll status' })
  updatePayrollStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { status: PayrollStatus; commentaire?: string },
  ) {
    return this.financeService.updatePayrollStatus(
      id,
      body.status,
      body.commentaire,
      req.user.sub,
    );
  }

  // ── Budgets ──────────────────────────────────────────────────

  @Post('budgets')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Create budget' })
  createBudget(@Request() req, @Body() dto: any) {
    return this.financeService.createBudget(dto, req.user.sub);
  }

  @Get('budgets')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Get all budgets' })
  getBudgets(
    @Request() req,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.financeService.getBudgets(department, status);
  }

  @Patch('budgets/:id/progress')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Update budget progress' })
  updateBudgetProgress(
    @Param('id') id: string,
    @Body() body: { amount: number; isSavings: boolean },
  ) {
    return this.financeService.updateBudgetProgress(id, body);
  }

  @Patch('budgets/:id/status')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Update budget status' })
  updateBudgetStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { status: BudgetStatus; commentaire?: string },
  ) {
    return this.financeService.updateBudgetStatus(
      id,
      body.status,
      body.commentaire,
      req.user.sub,
    );
  }

  // ── Investments ──────────────────────────────────────────────

  @Post('investments')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Create investment' })
  createInvestment(@Request() req, @Body() dto: any) {
    return this.financeService.createInvestment(dto);
  }

  @Get('investments')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Get all investments' })
  getInvestments(
    @Request() req,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.financeService.getInvestments(employeeId, status);
  }

  @Patch('investments/:id/status')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Update investment status' })
  updateInvestmentStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { status: InvestmentStatus; commentaire?: string },
  ) {
    return this.financeService.updateInvestmentStatus(
      id,
      body.status,
      body.commentaire,
      req.user.sub,
    );
  }

  // ── Dashboard ────────────────────────────────────────────────

  @Get('dashboard/stats')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Get finance dashboard stats' })
  getDashboardStats() {
    return this.financeService.getDashboardStats();
  }
}