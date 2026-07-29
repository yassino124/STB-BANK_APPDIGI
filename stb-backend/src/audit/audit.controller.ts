import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('📊 Audit Logs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('my-logs')
  @ApiOperation({ summary: 'Get my audit logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  async getMyLogs(
    @CurrentUser('sub') employeeId: string,
    @Query('limit') limit = 50,
    @Query('skip') skip = 0,
  ) {
    return this.auditService.getEmployeeLogs(employeeId, +limit, +skip);
  }

  @Get('my-logins')
  @ApiOperation({ summary: 'Get my recent login history' })
  async getMyLogins(@CurrentUser('sub') employeeId: string) {
    return this.auditService.getRecentLogins(employeeId);
  }

  @Get('employee/:id')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get audit logs for specific employee (RH/Admin)' })
  async getEmployeeLogs(
    @Param('id') employeeId: string,
    @Query('limit') limit = 50,
    @Query('skip') skip = 0,
  ) {
    return this.auditService.getEmployeeLogs(employeeId, +limit, +skip);
  }
}
