import { Controller, Get, Post, Patch, Param, UseGuards, Request, Query, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SendNotificationDto } from './dto/send-notification.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @Roles(Role.RH, Role.FINANCE, Role.AGENCE, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Send a custom notification to an employee or all active employees' })
  async sendNotification(@Body() dto: SendNotificationDto) {
    const result = await this.notificationsService.sendCustomNotification(dto);
    return { success: true, data: result };
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my notifications' })
  @ApiQuery({ name: 'employeeId', required: false, description: 'Employee ID (temporary fallback)' })
  async findMine(@Request() req, @Query('employeeId') employeeId?: string) {
    // Temporary: Accept employeeId as query param if no JWT auth
    const userId = employeeId || req.user?.sub;
    if (!userId) {
      return { success: false, statusCode: 400, message: 'Employee ID required', data: [] };
    }
    const notifications = await this.notificationsService.getMyNotifications(userId);
    return {
      success: true,
      data: {
        data: notifications,
        total: notifications.length,
        page: 1,
        limit: 100
      }
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get my unread notifications count' })
  @ApiQuery({ name: 'employeeId', required: false, description: 'Employee ID (temporary fallback)' })
  async getUnreadCount(@Request() req, @Query('employeeId') employeeId?: string) {
    const userId = employeeId || req.user?.sub;
    if (!userId) {
      return { success: false, statusCode: 400, message: 'Employee ID required' };
    }
    const count = await this.notificationsService.getUnreadCount(userId);
    return { success: true, data: { count } };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id') id: string) {
    const result = await this.notificationsService.markRead(id);
    return { success: true, data: result };
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all my notifications as read' })
  @ApiQuery({ name: 'employeeId', required: false, description: 'Employee ID (temporary fallback)' })
  async markAllRead(@Request() req, @Query('employeeId') employeeId?: string) {
    const userId = employeeId || req.user?.sub;
    if (!userId) {
      return { success: false, statusCode: 400, message: 'Employee ID required' };
    }
    const result = await this.notificationsService.markAllRead(userId);
    return { success: true, data: result };
  }
}
