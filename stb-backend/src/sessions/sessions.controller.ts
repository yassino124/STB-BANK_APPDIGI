import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('🔑 Sessions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({
    summary: '📋 Get my active sessions',
    description: 'Lists all active sessions across all devices.',
  })
  getMySessions(@CurrentUser('sub') employeeId: string) {
    return this.sessionsService.getMySessions(employeeId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '🔌 Disconnect a specific session',
  })
  revokeSession(
    @CurrentUser('sub') employeeId: string,
    @Param('id') sessionId: string,
  ) {
    return this.sessionsService.revokeSession(employeeId, sessionId);
  }

  @Delete()
  @ApiOperation({
    summary: '🔌 Disconnect ALL other sessions',
    description: 'Revokes all sessions except the current one.',
  })
  revokeAllSessions(
    @CurrentUser('sub') employeeId: string,
    @Headers('authorization') authHeader: string,
  ) {
    const currentToken = authHeader?.replace('Bearer ', '');
    return this.sessionsService.revokeAllSessions(employeeId, currentToken);
  }
}
