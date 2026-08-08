import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { HierarchyService } from './hierarchy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('🏢 Hierarchy (N+1)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hierarchy')
export class HierarchyController {
  constructor(private readonly hierarchyService: HierarchyService) {}

  @Post(':employeeId/build')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Build hierarchy entry for an employee' })
  buildForEmployee(@Param('employeeId') employeeId: string) {
    return this.hierarchyService.buildForEmployee(employeeId);
  }

  @Post('rebuild-all')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Rebuild all hierarchy entries' })
  rebuildAll() {
    return this.hierarchyService.rebuildAll();
  }

  @Get(':employeeId/chain')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get full hierarchy chain for an employee' })
  getChain(@Param('employeeId') employeeId: string) {
    return this.hierarchyService.getChain(employeeId);
  }

  @Get(':managerId/direct-reports')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get direct reports of a manager' })
  getDirectReports(@Param('managerId') managerId: string) {
    return this.hierarchyService.getDirectReports(managerId);
  }

  @Get('pending-approvals')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get leave requests pending my N+1 approval' })
  getPendingApprovals(@Request() req: any) {
    return this.hierarchyService.getPendingApprovals(req.user.sub);
  }

  @Post(':leaveRequestId/validate-approval')
  @Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Check if current user can approve a leave request' })
  validateApproval(
    @Param('leaveRequestId') leaveRequestId: string,
    @Request() req: any,
  ) {
    return this.hierarchyService.validateApproval(leaveRequestId, req.user.sub);
  }

  @Get('me/info')
  @ApiOperation({ summary: 'Get current user hierarchy info' })
  getMyInfo(@Request() req: any) {
    return this.hierarchyService.getChain(req.user.sub);
  }

  @Get('my-team')
  @ApiOperation({ summary: 'Get my direct reports (team members)' })
  getMyTeam(@Request() req: any) {
    return this.hierarchyService.getDirectReports(req.user.sub);
  }
}