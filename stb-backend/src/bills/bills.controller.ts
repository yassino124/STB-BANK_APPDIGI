import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BillsService } from './bills.service';
import { Bill } from './schemas/bill.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('📄 Bills')
@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create/Pay bill' })
  create(@Request() req, @Body() data: Partial<Bill>) {
    // Get employeeId from JWT or body
    const employeeId = data.employeeId || req.user?.sub;
    console.log('💳 Bill payment request:', { employeeId, data, user: req.user });
    
    if (!employeeId) {
      return { 
        success: false, 
        statusCode: 400, 
        message: 'Employee ID required',
        debug: { receivedData: data, user: req.user }
      };
    }
    
    return this.billsService.create({ ...data, employeeId });
  }

  @Get()
  @ApiOperation({ summary: 'List bills' })
  @ApiQuery({ name: 'employeeId', required: false, description: 'Employee ID (temporary fallback)' })
  findByEmployee(@Request() req, @Query('employeeId') employeeId: string) {
    const targetId = employeeId || req.user?.sub;
    console.log('💳 Bills list request:', { targetId, user: req.user });
    return this.billsService.findByEmployee(targetId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bill by ID' })
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update bill status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.billsService.updateStatus(id, status);
  }
}
