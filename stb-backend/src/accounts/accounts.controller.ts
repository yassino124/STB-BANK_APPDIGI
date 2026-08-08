import { Controller, Get, Post, Param, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('my')
  @ApiOperation({ summary: 'My bank accounts' })
  getMine(@Request() req) {
    return this.accountsService.getMyAccounts(req.user.sub);
  }

  @Get('all')
  @ApiOperation({ summary: 'All accounts (RH)' })
  getAll() {
    return this.accountsService.getAllAccounts();
  }

  @Post('employee/:id')
  @ApiOperation({ summary: 'Create account for employee (RH)' })
  createForEmployee(@Param('id') employeeId: string, @Body() body: { type?: any; initialBalance?: number }) {
    return this.accountsService.createForEmployee(employeeId, body.type, body.initialBalance);
  }

  @Patch(':id/freeze')
  @ApiOperation({ summary: 'Freeze account' })
  freeze(@Param('id') id: string) {
    return this.accountsService.freeze(id);
  }

  @Patch(':id/unfreeze')
  @ApiOperation({ summary: 'Unfreeze account' })
  unfreeze(@Param('id') id: string) {
    return this.accountsService.unfreeze(id);
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Deposit money to account (AGENCE)' })
  deposit(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.accountsService.deposit(id, body.amount);
  }
}
