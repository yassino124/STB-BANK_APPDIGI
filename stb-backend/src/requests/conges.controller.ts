import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Patch,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CongesService } from './conges.service';
import { CongeType } from './schemas/conge.schema';

@Controller('conges')
@UseGuards(JwtAuthGuard)
export class CongesController {
  constructor(private readonly congesService: CongesService) {}

  /**
   * Créer demande de congé
   * POST /api/v1/conges
   */
  @Post()
  async createConge(
    @Request() req,
    @Body() body: {
      type: CongeType;
      startDate: string;
      endDate: string;
      motif?: string;
    },
  ) {
    const employeeId = req.user.sub;
    const { type, startDate, endDate, motif } = body;

    if (!type || !startDate || !endDate) {
      throw new BadRequestException('Type, startDate et endDate requis');
    }

    const conge = await this.congesService.createCongeRequest(
      employeeId,
      type,
      new Date(startDate),
      new Date(endDate),
      motif,
    );

    return {
      success: true,
      message: 'Demande de congé créée avec succès',
      data: conge,
    };
  }

  /**
   * Mes congés
   * GET /api/v1/conges/my
   */
  @Get('my')
  async getMyConges(@Request() req) {
    const employeeId = req.user.sub;
    const conges = await this.congesService.getMyConges(employeeId);

    return {
      success: true,
      data: conges,
    };
  }

  /**
   * Tous les congés (RH/Admin)
   * GET /api/v1/conges
   */
  @Get()
  async getAllConges(@Query('statut') statut?: string, @Query('employeeId') employeeId?: string) {
    const conges = await this.congesService.getAllConges({ statut, employeeId });

    return {
      success: true,
      data: conges,
    };
  }

  /**
   * Demandes en attente pour un manager (ses subordonnés directs)
   * GET /api/v1/conges/pending-team
   */
  @Get('pending-team')
  async getPendingTeam(@Request() req) {
    const managerId = req.user.sub;
    const conges = await this.congesService.getPendingTeam(managerId);
    return {
      success: true,
      data: conges,
    };
  }

  /**
   * Calendrier équipe (managers)
   * GET /api/v1/conges/team-calendar?month=7&year=2026
   */
  @Get('team-calendar')
  async getTeamCalendar(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const managerId = req.user.sub;

    if (!month || !year) {
      throw new BadRequestException('month et year requis');
    }

    const conges = await this.congesService.getTeamCalendar(
      managerId,
      parseInt(month),
      parseInt(year),
    );

    return {
      success: true,
      data: conges,
    };
  }

  /**
   * Approuver congé (Manager/RH/DG)
   * PATCH /api/v1/conges/:id/approve
   */
  @Patch(':id/approve')
  async approveConge(
    @Request() req,
    @Param('id') congeId: string,
    @Body() body: { role: 'MANAGER' | 'RH' | 'DG' },
  ) {
    const approverId = req.user.sub;
    const { role } = body;

    if (!role) {
      throw new BadRequestException('Role requis (MANAGER, RH, DG)');
    }

    const conge = await this.congesService.approveConge(
      congeId,
      approverId,
      role,
    );

    return {
      success: true,
      message: `Congé approuvé par ${role}`,
      data: conge,
    };
  }

  /**
   * Refuser congé
   * PATCH /api/v1/conges/:id/refuse
   */
  @Patch(':id/refuse')
  async refuseConge(
    @Request() req,
    @Param('id') congeId: string,
    @Body() body: { reason: string },
  ) {
    const { reason } = body;

    if (!reason) {
      throw new BadRequestException('Raison de refus requise');
    }

    const conge = await this.congesService.refuseConge(congeId, reason);

    return {
      success: true,
      message: 'Congé refusé',
      data: conge,
    };
  }

  /**
   * Changer statut (compatible Dashboard RH)
   * PATCH /api/v1/conges/:id/status
   */
  @Patch(':id/status')
  async updateStatut(
    @Request() req,
    @Param('id') congeId: string,
    @Body() body: { statut: string; rejectionReason?: string },
  ) {
    const approverId = req.user.sub;
    const { statut, rejectionReason } = body;

    if (statut === 'APPROUVE') {
      // Detect role from user (if manager, use MANAGER role, else RH)
      const role = (req.user.roles || []).includes('MANAGER') ? 'MANAGER' : 'RH';
      const conge = await this.congesService.approveConge(congeId, approverId, role);
      return {
        success: true,
        message: 'Congé approuvé',
        data: conge,
      };
    } else if (statut === 'REFUSE') {
      const conge = await this.congesService.refuseConge(congeId, rejectionReason || 'Refusé');
      return {
        success: true,
        message: 'Congé refusé',
        data: conge,
      };
    } else {
      throw new BadRequestException('Statut invalide');
    }
  }

  /**
   * Upload justificatif
   * POST /api/v1/conges/:id/justificatif
   * Form-data: file
   */
  @Post(':id/justificatif')
  @UseInterceptors(FileInterceptor('file'))
  async uploadJustificatif(
    @Param('id') congeId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Fichier requis');
    }

    // TODO: Upload to S3 or local storage
    // For now, mock URL
    const fileData = {
      filename: file.originalname,
      url: `/uploads/conges/${congeId}/${file.originalname}`,
      mimetype: file.mimetype,
    };

    const conge = await this.congesService.uploadJustificatif(
      congeId,
      fileData,
    );

    return {
      success: true,
      message: 'Justificatif uploadé avec succès',
      data: conge,
    };
  }

  /**
   * Stats congés (pour RH)
   * GET /api/v1/conges/stats
   */
  @Get('stats')
  async getCongesStats() {
    // TODO: Implement stats
    return {
      success: true,
      data: {
        totalEnAttente: 0,
        totalApprouve: 0,
        totalRefuse: 0,
      },
    };
  }
}
