import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { Permission } from './schemas/permission.schema';

@ApiTags('🔐 Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create permission' })
  create(@Body() data: Partial<Permission>) {
    return this.permissionsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all permissions' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('resource/:resource')
  @ApiOperation({ summary: 'Get permissions by resource' })
  findByResource(@Param('resource') resource: string) {
    return this.permissionsService.findByResource(resource);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permission' })
  update(@Param('id') id: string, @Body() data: Partial<Permission>) {
    return this.permissionsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
