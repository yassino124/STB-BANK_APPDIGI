import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Absence, AbsenceDocument, AbsenceStatus, AbsenceType } from './schemas/absence.schema';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { EmployeeDocument } from '../employees/employee.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class AbsenceService {
  constructor(
    @InjectModel(Absence.name) private readonly absenceModel: Model<AbsenceDocument>,
    @InjectModel('Employee') private readonly employeeModel: Model<EmployeeDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(employeeId: string, dto: CreateAbsenceDto) {
    const employee = await this.employeeModel
      .findById(employeeId)
      .populate('managerId directorId centralDirectorId')
      .exec();

    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    if (dto.nombreHeures > 2) {
      throw new BadRequestException('Une absence ne peut pas dépasser 2 heures par mois');
    }

    // Build approval chain exactly like LeaveService
    const approvalHistory: any[] = [];
    const approvalChain: string[] = [];

    if (employee.managerId) {
      const manager: any = employee.managerId;
      approvalChain.push(manager._id.toString());
      approvalHistory.push({
        approverId: manager._id,
        approverName: `${manager.nom} ${manager.prenom}`,
        level: 1,
        decision: 'PENDING',
      });
    }
    if ((employee as any).directorId) {
      const director: any = (employee as any).directorId;
      approvalChain.push(director._id.toString());
      approvalHistory.push({
        approverId: director._id,
        approverName: `${director.nom} ${director.prenom}`,
        level: 2,
        decision: 'PENDING',
      });
    }
    if ((employee as any).centralDirectorId) {
      const centralDirector: any = (employee as any).centralDirectorId;
      approvalChain.push(centralDirector._id.toString());
      approvalHistory.push({
        approverId: centralDirector._id,
        approverName: `${centralDirector.nom} ${centralDirector.prenom}`,
        level: 3,
        decision: 'PENDING',
      });
    }

    if (approvalChain.length === 0) {
      throw new BadRequestException('Aucun manager assigné à cet employé');
    }

    const hasManagers = approvalChain.length > 0;
    const initialApproverId = hasManagers ? new Types.ObjectId(approvalChain[0]) : null;

    const absence = new this.absenceModel({
      employeeId: new Types.ObjectId(employeeId),
      type: dto.type,
      dateDebut: dto.dateDebut,
      dateFin: dto.dateFin,
      nombreHeures: dto.nombreHeures,
      motif: dto.motif || '',
      pieceJointe: dto.pieceJointe || null,
      status: AbsenceStatus.PENDING_N1,
      managerId: initialApproverId,         // keep for legacy
      currentApproverId: initialApproverId,
      approvalHistory,
    });

    const saved = await absence.save();

    // Notify first approver
    if (initialApproverId) {
      await this.notificationsService.sendToEmployee(
        initialApproverId.toString(),
        `📋 Nouvelle demande d'absence`,
        `${employee.nom} ${employee.prenom} a soumis une demande d'absence de ${dto.nombreHeures}h.`,
        NotificationType.HR_REQUEST,
      );
    }

    return saved;
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
        currentApproverId: new Types.ObjectId(managerId),
        status: AbsenceStatus.PENDING_N1,
      })
      .populate('employeeId', 'nom prenom matricule poste avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getMyTeamAbsences(managerId: string) {
    const managerIdObj = new Types.ObjectId(managerId);
    const subordinates = await this.employeeModel
      .find({
        $or: [
          { managerId: managerIdObj },
          { directorId: managerIdObj },
          { centralDirectorId: managerIdObj },
        ],
      })
      .select('_id')
      .exec();
    const subordinateIds = subordinates.map((e) => e._id);

    return this.absenceModel
      .find({
        $or: [
          { employeeId: { $in: subordinateIds } },
          { currentApproverId: managerIdObj },
        ],
      })
      .populate('employeeId', 'nom prenom matricule poste avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPendingForRh() {
    return this.absenceModel
      .find({ status: AbsenceStatus.APPROVED_N1 })
      .populate('employeeId', 'nom prenom matricule poste')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAll(status?: string) {
    const filter: any = {};
    if (status) filter.status = status;
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
    if (!absence) throw new NotFoundException("Demande d'absence non trouvée");

    if (absence.status !== AbsenceStatus.PENDING_N1) {
      throw new BadRequestException(`Statut invalide: ${absence.status}`);
    }

    // Find this manager's step in the approval history
    const stepIndex = absence.approvalHistory.findIndex(
      (h: any) => h.approverId?.toString() === managerId,
    );

    if (stepIndex === -1) {
      throw new ForbiddenException("Vous n'êtes pas dans la chaîne de validation de cette demande");
    }

    const currentStep = absence.approvalHistory[stepIndex] as any;

    if (decision === 'APPROVED') {
      currentStep.decision = 'APPROVED';
      currentStep.date = new Date();
      currentStep.comment = commentaire || '';
      absence.markModified('approvalHistory');

      // Find next pending step
      const nextStep = (absence.approvalHistory as any[]).find(
        (h) => h.level > currentStep.level && h.decision === 'PENDING',
      );

      if (nextStep) {
        // Move to next approver
        absence.currentApproverId = new Types.ObjectId(nextStep.approverId.toString());
        await this.notificationsService.sendToEmployee(
          absence.employeeId.toString(),
          `✅ Validé par ${currentStep.approverName}`,
          `Votre demande est maintenant en attente de ${nextStep.approverName}.`,
          NotificationType.HR_REQUEST,
        );
      } else {
        // All managers approved → send to RH
        absence.status = AbsenceStatus.APPROVED_N1;
        absence.currentApproverId = null as any;
        await this.notificationsService.sendToEmployee(
          absence.employeeId.toString(),
          `✅ Approuvée par tous les managers`,
          `Votre demande d'absence est maintenant en attente de validation RH.`,
          NotificationType.HR_REQUEST,
        );
      }
    } else {
      currentStep.decision = 'REJECTED';
      currentStep.date = new Date();
      currentStep.comment = commentaire || 'Refusé';
      absence.markModified('approvalHistory');
      absence.status = AbsenceStatus.REJECTED;
      absence.commentaire = commentaire || 'Refusé par le manager';

      await this.notificationsService.sendToEmployee(
        absence.employeeId.toString(),
        `❌ Demande d'absence refusée`,
        commentaire || 'Votre demande a été refusée par votre manager.',
        NotificationType.HR_REQUEST,
      );
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
    if (!absence) throw new NotFoundException("Demande d'absence non trouvée");

    if (absence.status !== AbsenceStatus.APPROVED_N1) {
      throw new BadRequestException(
        `Seules les demandes APPROVED_N1 peuvent être validées par RH. Statut: ${absence.status}`,
      );
    }

    if (decision === 'APPROVED') {
      absence.status = AbsenceStatus.APPROVED;
      absence.rhApprovedBy = new Types.ObjectId(rhId);
      absence.rhApprovedAt = new Date();
      absence.rhCommentaire = commentaire || '';
      absence.validatedBy = new Types.ObjectId(rhId);
      absence.validatedAt = new Date();
      absence.commentaire = commentaire || 'Validé par RH';

      await this.notificationsService.sendToEmployee(
        absence.employeeId.toString(),
        `✅ Absence approuvée`,
        `Votre demande d'absence a été approuvée par les Ressources Humaines.`,
        NotificationType.HR_REQUEST,
      );
    } else {
      absence.status = AbsenceStatus.REJECTED;
      absence.rhCommentaire = commentaire || 'Refusé par RH';
      absence.validatedBy = new Types.ObjectId(rhId);
      absence.validatedAt = new Date();
      absence.commentaire = commentaire || 'Refusé par RH';

      await this.notificationsService.sendToEmployee(
        absence.employeeId.toString(),
        `❌ Absence refusée par RH`,
        commentaire || 'Votre demande a été refusée par les Ressources Humaines.',
        NotificationType.HR_REQUEST,
      );
    }

    return absence.save();
  }

  async cancel(absenceId: string, employeeId: string) {
    const absence = await this.absenceModel.findById(absenceId);
    if (!absence) throw new NotFoundException("Demande d'absence non trouvée");

    if (absence.employeeId.toString() !== employeeId) {
      throw new BadRequestException('Vous ne pouvez annuler que votre propre demande');
    }

    if (absence.status !== AbsenceStatus.PENDING_N1) {
      throw new BadRequestException('Seules les demandes PENDING_N1 peuvent être annulées');
    }

    absence.status = AbsenceStatus.CANCELLED;
    absence.commentaire = "Annulée par l'employé";

    return absence.save();
  }
}