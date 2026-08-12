import { Controller, Get, Post, Param, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('my')
  @ApiOperation({ summary: 'My bank accounts' })
  getMine(@Request() req) {
    return this.accountsService.getMyAccounts(req.user.sub);
  }

  @Get('all')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'All accounts (RH)' })
  getAll() {
    return this.accountsService.getAllAccounts();
  }

  @Post('employee/:id')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create account for employee (RH)' })
  createForEmployee(@Param('id') employeeId: string, @Body() body: { type?: any; initialBalance?: number }) {
    return this.accountsService.createForEmployee(employeeId, body.type, body.initialBalance);
  }

  @Patch(':id/freeze')
  @Roles(Role.RH, Role.AGENCE, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Freeze account' })
  freeze(@Param('id') id: string) {
    return this.accountsService.freeze(id);
  }

  @Patch(':id/unfreeze')
  @Roles(Role.RH, Role.AGENCE, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Unfreeze account' })
  unfreeze(@Param('id') id: string) {
    return this.accountsService.unfreeze(id);
  }

  @Post(':id/deposit')
  @Roles(Role.AGENCE, Role.FINANCE, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deposit money to account (AGENCE)' })
  deposit(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.accountsService.deposit(id, body.amount);
  }
}
