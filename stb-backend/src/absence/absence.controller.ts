import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Absence Requests')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('absences')
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Post()
  @ApiOperation({ summary: 'Submit absence request (Employee)' })
  create(@Request() req, @Body() dto: any) {
    return this.absenceService.create(req.user.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'My absence requests' })
  getMine(@Request() req) {
    return this.absenceService.getMyAbsences(req.user.sub);
  }

  @Get('pending-manager')
  @ApiOperation({ summary: 'Absence requests pending my N+1 approval' })
  getPendingForManager(@Request() req) {
    return this.absenceService.getPendingForManager(req.user.sub);
  }

  @Get('pending-rh')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Pending RH validation' })
  getPendingRh() {
    return this.absenceService.getPendingForRh();
  }

  @Get('all')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'All requests (RH)' })
  getAll(@Query('status') status?: string) {
    return this.absenceService.getAll(status);
  }

  @Patch(':id/handle-manager')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Manager approves or rejects absence (N+1)' })
  handleManagerApproval(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { decision: 'APPROVED' | 'REJECTED'; commentaire?: string },
  ) {
    return this.absenceService.handleManagerApproval(
      id,
      req.user.sub,
      body.decision,
      body.commentaire,
    );
  }

  @Patch(':id/handle-rh')
  @Roles(Role.RH, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'RH validates or rejects approved absence request' })
  handleRhApproval(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { decision: 'APPROVED' | 'REJECTED'; commentaire?: string },
  ) {
    return this.absenceService.handleRhApproval(
      id,
      req.user.sub,
      body.decision,
      body.commentaire,
    );
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel pending absence request' })
  cancel(@Param('id') id: string, @Request() req) {
    return this.absenceService.cancel(id, req.user.sub);
  }
}