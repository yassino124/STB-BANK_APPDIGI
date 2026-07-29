import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthorizationsService } from './authorizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authorizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('authorizations')
export class AuthorizationsController {
  constructor(private readonly authorizationsService: AuthorizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create authorization request' })
  create(@Request() req, @Body() dto: any) {
    return this.authorizationsService.create(req.user.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'My authorization requests' })
  getMine(@Request() req) {
    return this.authorizationsService.getMine(req.user.sub);
  }

  @Get('all')
  @ApiOperation({ summary: 'All authorization requests (RH)' })
  getAll() {
    return this.authorizationsService.getAll();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Pending authorizations (RH)' })
  getPending() {
    return this.authorizationsService.getAll('PENDING');
  }

  @Patch(':id/handle')
  @ApiOperation({ summary: 'Approve/Reject authorization (RH)' })
  handle(@Param('id') id: string, @Request() req, @Body() body: { decision: 'APPROVED' | 'REJECTED'; commentaire?: string }) {
    return this.authorizationsService.handle(id, req.user.sub, body.decision, body.commentaire);
  }
}
