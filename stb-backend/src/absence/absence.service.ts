import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Absence, AbsenceDocument, AbsenceStatus, AbsenceType } from './schemas/absence.schema';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { EmployeeDocument } from '../employees/employee.schema';

@Injectable()
export class AbsenceService {
  constructor(
    @InjectModel(Absence.name) private readonly absenceModel: Model<AbsenceDocument>,
    @InjectModel('Employee') private readonly employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(employeeId: string, dto: CreateAbsenceDto) {
    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    if (dto.nombreHeures > 2) {
      throw new BadRequestException('Une absence ne peut pas dépasser 2 heures par mois');
    }

    const managerId = employee.managerId;
    if (!managerId) {
      throw new BadRequestException('Aucun manager assigné à cet employé');
    }

    const absence = new this.absenceModel({
      employeeId: new Types.ObjectId(employeeId),
      type: dto.type,
      dateDebut: dto.dateDebut,
      dateFin: dto.dateFin,
      nombreHeures: dto.nombreHeures,
      motif: dto.motif || '',
      pieceJointe: dto.pieceJointe || null,
      status: AbsenceStatus.PENDING_N1,
      managerId: new Types.ObjectId(managerId),
    });

    return absence.save();
  }

  async getMyAbsences(employeeId: string) {
    return this.absenceModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPendingForManager(managerId: string) {
    return this.absenceModel
      .find({
        managerId: new Types.ObjectId(managerId),
        status: AbsenceStatus.PENDING_N1,
      })
      .populate('employeeId', 'nom prenom matricule poste')
      .exec();
  }

  async getPendingForRh() {
    return this.absenceModel
      .find({ status: AbsenceStatus.APPROVED_N1 })
      .populate('employeeId', 'nom prenom matricule poste')
      .populate('n1ApprovedBy', 'nom prenom matricule')
      .exec();
  }

  async getAll(status?: string) {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return this.absenceModel
      .find(filter)
      .populate('employeeId', 'nom prenom matricule poste')
      .sort({ createdAt: -1 })
      .exec();
  }

  async handleManagerApproval(
    absenceId: string,
    managerId: string,
    decision: 'APPROVED' | 'REJECTED',
    commentaire?: string,
  ) {
    const absence = await this.absenceModel.findById(absenceId);
    if (!absence) {
      throw new NotFoundException('Demande d\'absence non trouvée');
    }

    if (absence.status !== AbsenceStatus.PENDING_N1) {
      throw new BadRequestException(`Statut invalide: ${absence.status}`);
    }

    if (absence.managerId.toString() !== managerId) {
      throw new BadRequestException('Vous n\'êtes pas le manager de cette demande');
    }

    if (decision === 'APPROVED') {
      absence.status = AbsenceStatus.APPROVED_N1;
      absence.n1ApprovedBy = new Types.ObjectId(managerId);
      absence.n1ApprovedAt = new Date();
      absence.n1Commentaire = commentaire || '';
    } else {
      absence.status = AbsenceStatus.REJECTED;
      absence.n1Commentaire = commentaire || 'Sans motif';
      absence.validatedBy = new Types.ObjectId(managerId);
      absence.validatedAt = new Date();
      absence.commentaire = commentaire || 'Refusé par le manager';
    }

    return absence.save();
  }

  async handleRhApproval(
    absenceId: string,
    rhId: string,
    decision: 'APPROVED' | 'REJECTED',
    commentaire?: string,
  ) {
    const absence = await this.absenceModel.findById(absenceId);
    if (!absence) {
      throw new NotFoundException('Demande d\'absence non trouvée');
    }

    if (absence.status !== AbsenceStatus.APPROVED_N1) {
      throw new BadRequestException(`Seules les demandes APPROVED_N1 peuvent être validées par RH. Statut actuel: ${absence.status}`);
    }

    if (decision === 'APPROVED') {
      absence.status = AbsenceStatus.APPROVED;
      absence.rhApprovedBy = new Types.ObjectId(rhId);
      absence.rhApprovedAt = new Date();
      absence.rhCommentaire = commentaire || '';
      absence.validatedBy = new Types.ObjectId(rhId);
      absence.validatedAt = new Date();
      absence.commentaire = commentaire || 'Validé par RH';
    } else {
      absence.status = AbsenceStatus.REJECTED;
      absence.rhCommentaire = commentaire || 'Refusé par RH';
      absence.validatedBy = new Types.ObjectId(rhId);
      absence.validatedAt = new Date();
      absence.commentaire = commentaire || 'Refusé par RH';
    }

    return absence.save();
  }

  async cancel(absenceId: string, employeeId: string) {
    const absence = await this.absenceModel.findById(absenceId);
    if (!absence) {
      throw new NotFoundException('Demande d\'absence non trouvée');
    }

    if (absence.employeeId.toString() !== employeeId) {
      throw new BadRequestException('Vous ne pouvez annuler que votre propre demande');
    }

    if (absence.status !== AbsenceStatus.PENDING_N1) {
      throw new BadRequestException('Seules les demandes PENDING_N1 peuvent être annulées');
    }

    absence.status = AbsenceStatus.CANCELLED;
    absence.commentaire = 'Annulée par l\'employé';

    return absence.save();
  }
}