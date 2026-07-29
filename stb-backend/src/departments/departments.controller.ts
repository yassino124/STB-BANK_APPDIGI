import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { Department } from './schemas/department.schema';

@ApiTags('🏢 Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create department' })
  create(@Body() data: Partial<Department>) {
    return this.departmentsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all departments' })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Department statistics' })
  getStats() {
    return this.departmentsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update department' })
  update(@Param('id') id: string, @Body() data: Partial<Department>) {
    return this.departmentsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department' })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
