import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { Budget } from './schemas/budget.schema';

@ApiTags('💰 Budgets')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create budget or savings goal' })
  create(@Body() data: Partial<Budget>) {
    return this.budgetsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List budgets and savings goals' })
  findByEmployee(@Query('employeeId') employeeId: string) {
    return this.budgetsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by ID' })
  findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget' })
  update(@Param('id') id: string, @Body() data: Partial<Budget>) {
    return this.budgetsService.update(id, data);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update savings/spending progress' })
  updateProgress(
    @Param('id') id: string,
    @Body() data: { amount: number; isSavings?: boolean }
  ) {
    return this.budgetsService.updateProgress(id, data.amount, data.isSavings);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete budget' })
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(id);
  }
}
