import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BeneficiariesService } from './beneficiaries.service';
import { Beneficiary } from './schemas/beneficiary.schema';

@ApiTags('👥 Beneficiaries')
@Controller('beneficiaries')
export class BeneficiariesController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Post()
  @ApiOperation({ summary: 'Create beneficiary' })
  create(@Body() data: Partial<Beneficiary>) {
    return this.beneficiariesService.create(data.employeeId as unknown as string, data);
  }

  @Get()
  @ApiOperation({ summary: 'List beneficiaries for employee' })
  findByEmployee(@Query('employeeId') employeeId: string) {
    return this.beneficiariesService.findByEmployee(employeeId);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'List favorite beneficiaries' })
  findFavorites(@Query('employeeId') employeeId: string) {
    return this.beneficiariesService.findFavorites(employeeId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update beneficiary' })
  update(@Param('id') id: string, @Body() data: Partial<Beneficiary>) {
    return this.beneficiariesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete beneficiary' })
  remove(@Param('id') id: string) {
    return this.beneficiariesService.remove(id);
  }
}
