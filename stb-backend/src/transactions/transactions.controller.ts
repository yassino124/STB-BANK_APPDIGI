import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get all transactions for logged in user' })
  @ApiQuery({ name: 'employeeId', required: false, description: 'Employee ID (temporary fallback)' })
  async findMine(@Request() req, @Query('employeeId') employeeId?: string) {
    const userId = employeeId || req.user?.sub;
    if (!userId) {
      return { success: false, statusCode: 400, message: 'Employee ID required', data: [] };
    }
    const result = await this.transactionsService.getMyTransactions(userId);
    return {
      success: true,
      data: {
        data: result.data,
        total: result.total,
        page: result.page,
        limit: 100
      }
    };
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer money between employees' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fromEmployeeId: { type: 'string', description: 'Sender employee ID' },
        toEmployeeId: { type: 'string', description: 'Receiver employee ID (alternative to toMatricule)' },
        toMatricule: { type: 'string', description: 'Receiver matricule (alternative to toEmployeeId)' },
        amount: { type: 'number', description: 'Transfer amount (also accepts montant)' },
        montant: { type: 'number', description: 'Transfer amount (alternative to amount)' },
        description: { type: 'string' },
        motif: { type: 'string', description: 'Transfer reason (alternative to description)' },
      },
    },
  })
  async transfer(@Request() req, @Body() body: any) {
    console.log('📥 Full request:', { headers: req.headers, body: req.body, bodyParam: body });
    
    // Try to get body from request directly if @Body() fails
    const requestBody = body || req.body || {};
    console.log('📥 Using body:', JSON.stringify(requestBody));
    
    // Support both field names (mobile app uses different names)
    const fromEmployeeId = requestBody.fromEmployeeId;
    const toEmployeeId = requestBody.toEmployeeId;
    const toMatricule = requestBody.toMatricule;
    const amount = requestBody.amount || requestBody.montant;
    const description = requestBody.description || requestBody.motif || 'Transfer';
    
    // Validate required fields
    if (!fromEmployeeId) {
      return { success: false, statusCode: 400, message: 'Missing fromEmployeeId', debug: { receivedBody: requestBody } };
    }
    if (!toEmployeeId && !toMatricule) {
      return { success: false, statusCode: 400, message: 'Missing toEmployeeId or toMatricule', debug: { receivedBody: requestBody } };
    }
    if (!amount || amount <= 0) {
      return { success: false, statusCode: 400, message: 'Invalid amount', debug: { receivedBody: requestBody, amount } };
    }
    
    try {
      let result;
      
      // If toEmployeeId is provided, use it directly
      if (toEmployeeId) {
        console.log(`✅ Transfer by ID: ${fromEmployeeId} -> ${toEmployeeId}, amount: ${amount}`);
        result = await this.transactionsService.createTransferById(
          fromEmployeeId,
          toEmployeeId,
          amount,
          description
        );
      } 
      // If toMatricule is provided, use the original method
      else if (toMatricule) {
        console.log(`✅ Transfer by Matricule: ${fromEmployeeId} -> ${toMatricule}, amount: ${amount}`);
        result = await this.transactionsService.createTransfer(
          fromEmployeeId,
          toMatricule,
          amount,
          description
        );
      }
      
      console.log('✅ Transfer successful:', result._id);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Transfer error:', error.message, error.stack);
      // Re-throw so NestJS exception filters return proper HTTP 400/4xx
      throw error;
    }
  }

  @Get('employee/:id')
  @ApiOperation({ summary: 'Get all transactions for specific employee (RH)' })
  async findEmployeeTx(@Param('id') id: string) {
    const transactions = await this.transactionsService.getEmployeeTransactions(id);
    return { success: true, data: transactions };
  }
}
