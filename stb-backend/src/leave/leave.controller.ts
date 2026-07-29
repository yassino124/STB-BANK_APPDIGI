import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('� Leave Requests')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @ApiOperation({ summary: 'Submit leave request (Employee)' })
  create(@Request() req, @Body() dto: { type: string; dateDebut: string; dateFin: string; motif: string }) {
    return this.leaveService.createRequest(req.user.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'My leave requests' })
  getMine(@Request() req) {
    return this.leaveService.getMyRequests(req.user.sub);
  }

  @Get('my-balance')
  @ApiOperation({ summary: 'My leave balance' })
  getBalance(@Request() req) {
    return this.leaveService.getMyBalance(req.user.sub);
  }

  @Get('pending-manager')
  @ApiOperation({ summary: 'Leave requests pending my N+1 approval' })
  getPendingForManager(@Request() req) {
    return this.leaveService.getPendingForManager(req.user.sub);
  }

  @Get('my-team')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'All leave requests from my direct reports' })
  getMyTeamRequests(@Request() req) {
    return this.leaveService.getMyTeamRequests(req.user.sub);
  }

  @Get('all')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'All requests (RH)' })
  getAll(@Query('status') status?: string) {
    return this.leaveService.getAllRequests(status);
  }

  @Get('pending-rh')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Pending RH validation' })
  getPendingRh() {
    return this.leaveService.getAllRequests('APPROVED_N1');
  }

  @Patch(':id/handle-manager')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Manager approves or rejects leave (N+1)' })
  handleManagerApproval(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { decision: 'APPROVED' | 'REJECTED'; commentaire?: string },
  ) {
    return this.leaveService.handleManagerApproval(id, req.user.sub, body.decision, body.commentaire);
  }

  @Patch(':id/handle-rh')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'RH validates or rejects approved leave request' })
  handleRhApproval(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { decision: 'APPROVED' | 'REJECTED'; commentaire?: string },
  ) {
    return this.leaveService.handleRhApproval(id, req.user.sub, body.decision, body.commentaire);
  }

  @Post(':id/manager-approve')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '✅ Manager approves leave (simplified endpoint for mobile)' })
  managerApprove(@Param('id') id: string, @Request() req, @Body() body: { commentaire?: string }) {
    return this.leaveService.handleManagerApproval(id, req.user.sub, 'APPROVED', body.commentaire || '');
  }

  @Post(':id/manager-reject')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '❌ Manager rejects leave (simplified endpoint for mobile)' })
  managerReject(@Param('id') id: string, @Request() req, @Body() body: { commentaire?: string }) {
    return this.leaveService.handleManagerApproval(id, req.user.sub, 'REJECTED', body.commentaire || 'Refusé par le manager');
  }

  @Get('pending-team')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: '📋 Get all pending leave requests from my team (for swipe UI)' })
  getPendingTeam(@Request() req) {
    return this.leaveService.getPendingForManager(req.user.sub);
  }
}