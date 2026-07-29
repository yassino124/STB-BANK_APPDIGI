import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { Branch } from './schemas/branch.schema';

@ApiTags('🏦 Branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create branch' })
  create(@Body() data: Partial<Branch>) {
    return this.branchesService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all branches' })
  findAll() {
    return this.branchesService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Branch statistics' })
  getStats() {
    return this.branchesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch' })
  update(@Param('id') id: string, @Body() data: Partial<Branch>) {
    return this.branchesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete branch' })
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
