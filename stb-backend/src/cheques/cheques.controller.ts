import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChequesService } from './cheques.service';
import { CreateChequeRequestDto, UpdateChequeStatusDto } from './dto/cheques.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('cheques')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChequesController {
  constructor(private readonly service: ChequesService) {}

  @Post('my')
  createMyRequest(@Request() req, @Body() dto: CreateChequeRequestDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get('my')
  getMyRequests(@Request() req) {
    return this.service.findByEmployee(req.user.userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RH)
  findAll() {
    return this.service.findAll();
  }

  @Put(':id/status')
  @Roles(Role.ADMIN, Role.RH)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateChequeStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}
