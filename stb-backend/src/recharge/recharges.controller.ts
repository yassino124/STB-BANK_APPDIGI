import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RechargesService } from './recharges.service';
import { Recharge } from './schemas/recharge.schema';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('📱 Recharge')
@UseGuards(JwtAuthGuard)
@Controller('recharges')
export class RechargesController {
  constructor(private readonly rechargesService: RechargesService) {}

  @Post()
  @ApiOperation({ summary: 'Create recharge' })
  create(@Request() req, @Body() data: Partial<Recharge>) {
    // Use req.user.sub for JWT payload (not userId)
    const employeeId = data.employeeId || req.user?.sub;
    console.log('📱 Recharge create request:', { employeeId, data, user: req.user });
    
    if (!employeeId) {
      return { 
        success: false, 
        statusCode: 400, 
        message: 'Employee ID required',
        debug: { receivedData: data, user: req.user }
      };
    }
    
    return this.rechargesService.create({ ...data, employeeId });
  }

  @Get()
  @ApiOperation({ summary: 'List recharges' })
  findByEmployee(@Request() req, @Query('employeeId') employeeId: string) {
    const targetId = employeeId || req.user?.sub;
    console.log('📱 Recharges list request:', { targetId, user: req.user });
    return this.rechargesService.findByEmployee(targetId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recharge by ID' })
  findOne(@Param('id') id: string) {
    return this.rechargesService.findOne(id);
  }
}
