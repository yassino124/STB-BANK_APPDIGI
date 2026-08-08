import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('my')
  @ApiOperation({ summary: 'My cards' })
  getMine(@Request() req) {
    return this.cardsService.getMyCards(req.user.sub);
  }

  @Get('all')
  @ApiOperation({ summary: 'All cards (Agence)' })
  getAll() {
    return this.cardsService.getAllCards();
  }

  @Patch(':id/freeze')
  @ApiOperation({ summary: 'Freeze card' })
  freeze(@Param('id') id: string) {
    return this.cardsService.freeze(id);
  }

  @Post('employee/:id')
  @ApiOperation({ summary: 'Create card for employee (RH)' })
  async createForEmployee(@Param('id') employeeId: string, @Body() body: { type?: any }) {
    return this.cardsService.createForEmployeeWithoutAccountId(employeeId, body.type);
  }

  @Patch(':id/unfreeze')
  @ApiOperation({ summary: 'Unfreeze card' })
  unfreeze(@Param('id') id: string) {
    return this.cardsService.unfreeze(id);
  }

  @Patch(':id/limit')
  @ApiOperation({ summary: 'Update card limits' })
  updateLimits(@Param('id') id: string, @Body() body: { limitQuotidien: number; limitMensuel: number }) {
    return this.cardsService.updateLimits(id, { daily: body.limitQuotidien, monthly: body.limitMensuel });
  }
}
