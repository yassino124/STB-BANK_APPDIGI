import { Controller, Get, Delete, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('📱 Devices')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiOperation({
    summary: '📱 Get my trusted devices',
    description: 'Returns all registered devices for the current employee.',
  })
  getMyDevices(@CurrentUser('sub') employeeId: string) {
    return this.devicesService.getMyDevices(employeeId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '🗑️ Remove a device',
    description: 'Completely removes a device. It will need to be re-registered on next login.',
  })
  removeDevice(
    @CurrentUser('sub') employeeId: string,
    @Param('id') deviceId: string,
  ) {
    return this.devicesService.removeDevice(employeeId, deviceId);
  }

  @Patch(':id/revoke-trust')
  @ApiOperation({
    summary: '🚫 Revoke trust from device',
    description: 'Marks device as untrusted and disables biometrics for it.',
  })
  revokeTrust(
    @CurrentUser('sub') employeeId: string,
    @Param('id') deviceId: string,
  ) {
    return this.devicesService.revokeTrust(employeeId, deviceId);
  }
}
