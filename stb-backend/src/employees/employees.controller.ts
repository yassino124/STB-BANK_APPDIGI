import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { ActivityLogsService } from '../activity_logs/activity-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../common/enums/role.enum';
import {
  CreateEmployeeDto,
  UpdateEmployeeRolesDto,
  UpdateEmployeeStatusDto,
  UpdateEmployeeFinancialsDto,
  UpdateEmployeeAvatarDto,
} from './dto/employee.dto';

@ApiTags('👤 Employees')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: '➕ Create employee (RH only)',
    description: 'RH creates an employee account. Employee will need to self-activate via the app.',
  })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 409, description: 'Employee with same matricule/CIN/email already exists' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Get()
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.FINANCE, Role.AGENCE, Role.IT)
  @ApiOperation({ summary: '📋 List all employees (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.employeesService.findAll(+page, +limit, search);
  }

  @Get('directory')
  @ApiOperation({ summary: '📋 Get all employees for hierarchy dropdowns (name, matricule, poste, roles)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  getDirectory(@Query('search') search?: string) {
    return this.employeesService.getDirectory(search);
  }

  @Get('directory/search')
  @ApiOperation({ summary: '🔍 Search employee directory (Accessible to all authenticated users)' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query (min 2 chars)' })
  searchDirectory(@Query('q') query: string) {
    return this.employeesService.searchDirectory(query);
  }

  @Get('stats')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: '📊 Employee statistics dashboard' })
  getStats() {
    return this.employeesService.getStats();
  }

  @Get('my/activity')
  @ApiOperation({ summary: '📜 Get my activity timeline (Transactions, Payroll, Leaves...)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  getMyActivityTimeline(@Req() req: any, @Query('limit') limit = 20) {
    return this.activityLogsService.getMyActivityTimeline(req.user.userId || req.user._id, +limit);
  }

  @Get(':id/avatar')
  @Public()
  @ApiOperation({ summary: '🖼️ Get employee avatar as image (public)' })
  async getAvatar(@Param('id') id: string, @Req() req: any) {
    const employee = await this.employeesService.findOne(id);
    if (!employee || !employee.avatar) {
      throw new Error('Avatar not found');
    }
    
    // Extract base64 data
    const base64Data = employee.avatar.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Return as image
    req.res.setHeader('Content-Type', 'image/jpeg');
    req.res.setHeader('Content-Length', buffer.length);
    req.res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 1 day
    return buffer;
  }

  @Get(':id/finance-profile')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.FINANCE, Role.AGENCE)
  @ApiOperation({ 
    summary: '💰 Get employee finance profile with REAL calculations',
    description: 'Returns salaire net AFTER credit/avance deductions, not just raw data'
  })
  getFinanceProfile(@Param('id') id: string) {
    return this.employeesService.getFinanceProfile(id);
  }

  @Get(':id')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.FINANCE, Role.AGENCE)
  @ApiOperation({ summary: '🔍 Get employee by ID' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id/roles')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: '🏷️ Update employee roles (RH only)',
    description: 'Assign or change roles: EMPLOYEE, RH, MANAGER, FINANCE, ADMIN, SUPER_ADMIN',
  })
  updateRoles(@Param('id') id: string, @Body() dto: UpdateEmployeeRolesDto) {
    return this.employeesService.updateRoles(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: '🔄 Update employee status (activate/suspend/deactivate)',
  })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateEmployeeStatusDto) {
    return this.employeesService.updateStatus(id, dto);
  }

  @Patch(':id/financials')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({
    summary: '💰 Update employee financials (Congés, Crédits, Prime)',
  })
  updateFinancials(@Param('id') id: string, @Body() dto: UpdateEmployeeFinancialsDto) {
    return this.employeesService.updateFinancials(id, dto);
  }

  @Patch(':id/avatar')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: '🖼️ Update employee avatar',
  })
  updateAvatar(@Param('id') id: string, @Body() dto: UpdateEmployeeAvatarDto) {
    return this.employeesService.updateAvatar(id, dto);
  }
}
