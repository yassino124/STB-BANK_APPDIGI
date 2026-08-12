import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get full employee dashboard aggregated data' })
  getMyDashboard(@Request() req) {
    return this.dashboardService.getEmployeeDashboard(req.user.sub);
  }

  @Get('rh')
  @ApiOperation({ summary: 'Get RH admin dashboard stats' })
  getRhDashboard() {
    return this.dashboardService.getRhDashboard();
  }

  @Get('it')
  @ApiOperation({ summary: 'Get IT Operations dashboard stats' })
  getItDashboard() {
    return this.dashboardService.getItDashboard();
  }

  @Get('advanced-analytics')
  @ApiOperation({ summary: 'Get full advanced analytics data for all roles' })
  getAdvancedAnalytics() {
    return this.dashboardService.getAdvancedAnalytics();
  }
}
