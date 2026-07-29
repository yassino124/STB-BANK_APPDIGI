import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AvancesService } from './avances.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvanceType, AvanceStatut } from './schemas/avance.schema';

@Controller('avances')
@UseGuards(JwtAuthGuard)
export class AvancesController {
  constructor(private readonly avancesService: AvancesService) {}

  @Post()
  async create(@Request() req, @Body() body: { type: AvanceType; montant: number; motif?: string }) {
    const avance = await this.avancesService.create(req.user.sub, body);
    return {
      success: true,
      message: 'Demande d\'avance créée avec succès',
      data: avance,
    };
  }

  @Get('my')
  async getMyAvances(@Request() req) {
    const avances = await this.avancesService.getMyAvances(req.user.sub);
    return {
      success: true,
      data: avances,
    };
  }

  @Get()
  async getAllAvances(@Query('statut') statut?: AvanceStatut, @Query('employeeId') employeeId?: string) {
    const avances = await this.avancesService.getAllAvances({ statut, employeeId });
    return {
      success: true,
      data: avances,
    };
  }

  @Patch(':id/status')
  async updateStatut(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { statut: AvanceStatut; rejectionReason?: string },
  ) {
    const avance = await this.avancesService.updateStatut(
      id,
      body.statut,
      req.user.sub,
      body.rejectionReason,
    );
    return {
      success: true,
      message: `Avance ${body.statut === AvanceStatut.APPROUVE ? 'approuvée' : 'refusée'}`,
      data: avance,
    };
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    const result = await this.avancesService.delete(id, req.user.sub);
    return result;
  }
}
