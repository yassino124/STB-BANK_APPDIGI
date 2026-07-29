import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvestmentsService } from './investments.service';
import { Investment } from './schemas/investment.schema';

@ApiTags('📈 Investments')
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create investment' })
  create(@Body() data: Partial<Investment>) {
    return this.investmentsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List investments' })
  findByEmployee(@Query('employeeId') employeeId: string) {
    return this.investmentsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get investment by ID' })
  findOne(@Param('id') id: string) {
    return this.investmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update investment' })
  update(@Param('id') id: string, @Body() data: Partial<Investment>) {
    return this.investmentsService.update(id, data);
  }
}
