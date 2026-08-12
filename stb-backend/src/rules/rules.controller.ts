import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RulesService } from './rules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Business Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all business rules configuration' })
  getRules() {
    return this.rulesService.getRules();
  }

  @Post()
  @Roles(Role.RH, Role.ADMIN)
  @ApiOperation({ summary: 'Update business rules configuration (RH/ADMIN only)' })
  updateRules(@Body() newConfig: Record<string, any>) {
    return this.rulesService.updateRules(newConfig);
  }
}
