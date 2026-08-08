import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveRequest, LeaveBalance, LeaveStatus } from './schemas/leave.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { HierarchyService } from '../hierarchy/hierarchy.service';
import { Employee } from '../employees/employee.schema';

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalance>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    private notificationsService: NotificationsService,
    private hierarchyService: HierarchyService,
  ) {}

  async createRequest(employeeId: string, dto: { type: string; dateDebut: string; dateFin: string; motif: string }) {
    const dateDebut = new Date(dto.dateDebut);
    const dateFin = new Date(dto.dateFin);
    const diffTime = Math.abs(dateFin.getTime() - dateDebut.getTime());
    const nombreJours = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const balance = await this.getOrCreateBalance(employeeId);
    const soldeDisponible = balance.soldeAnnuel - balance.soldeUtilise;
    if (nombreJours > soldeDisponible) {
      throw new BadRequestException(`Solde insuffisant. Disponible: ${soldeDisponible} jours`);
    }

    const employee = await this.employeeModel.findById(employeeId).populate('managerId directorId centralDirectorId').exec();
    if (!employee) throw new BadRequestException('Employé introuvable');

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
    if (employee.directorId) {
      const director: any = employee.directorId;
      approvalChain.push(director._id.toString());
      approvalHistory.push({
        approverId: director._id,
        approverName: `${director.nom} ${director.prenom}`,
        level: 2,
        decision: 'PENDING',
      });
    }
    if (employee.centralDirectorId) {
      const centralDirector: any = employee.centralDirectorId;
      approvalChain.push(centralDirector._id.toString());
      approvalHistory.push({
        approverId: centralDirector._id,
        approverName: `${centralDirector.nom} ${centralDirector.prenom}`,
        level: 3,
        decision: 'PENDING',
      });
    }

    const hasManagers = approvalChain.length > 0;
    const initialStatus = hasManagers ? LeaveStatus.PENDING_MANAGER : LeaveStatus.PENDING_RH;
    const initialApprover = hasManagers ? new Types.ObjectId(approvalChain[0]) : null;

    const createData: any = {
      employeeId: new Types.ObjectId(employeeId),
      type: dto.type as any,
      dateDebut,
      dateFin,
      nombreJours,
      motif: dto.motif,
      status: initialStatus,
      currentApproverId: initialApprover,
      approvalHistory: approvalHistory,
    };
    if (employee.managerId) {
      const manager: any = employee.managerId;
      createData.managerId = new Types.ObjectId(manager._id.toString());
    }

    return this.leaveRequestModel.create(createData);
  }

  async getMyRequests(employeeId: string) {
    return this.leaveRequestModel.find({ employeeId: new Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
  }

  async getPendingForManager(managerId: string) {
    return this.leaveRequestModel
      .find({
        currentApproverId: { $in: [managerId, new Types.ObjectId(managerId)] },
        status: LeaveStatus.PENDING_MANAGER,
      })
      .populate('employeeId', 'nom prenom matricule poste department soldeConges avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getMyTeamRequests(managerId: string) {
    // Find all employees who have this person in their hierarchy chain (N+1, N+2, N+3)
    const managerIdQuery = { $in: [managerId, new Types.ObjectId(managerId)] };
    const subordinates = await this.employeeModel
      .find({ 
        $or: [
          { managerId: managerIdQuery },
          { directorId: managerIdQuery },
          { centralDirectorId: managerIdQuery }
        ]
      })
      .select('_id')
      .exec();
    const subordinateIds = subordinates.map((e) => e._id);

    return this.leaveRequestModel
      .find({ 
        $or: [
          { employeeId: { $in: subordinateIds } },
          { currentApproverId: new Types.ObjectId(managerId) }
        ]
      })
      .populate('employeeId', 'nom prenom matricule poste avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async handleManagerApproval(id: string, managerId: string, decision: 'APPROVED' | 'REJECTED', commentaire = '') {
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) throw new NotFoundException('Demande de congé introuvable');

    if (request.status !== LeaveStatus.PENDING_MANAGER) {
      throw new BadRequestException(`Demande déjà traitée. Statut actuel: ${request.status}`);
    }

    const historyStepIndex = request.approvalHistory.findIndex(h => h.approverId?.toString() === managerId);
    if (historyStepIndex === -1) {
      throw new ForbiddenException('Vous n\'êtes pas dans la chaîne de validation de cette demande');
    }
    const historyStep = request.approvalHistory[historyStepIndex];

    if (decision === 'APPROVED') {
      request.approvalHistory[historyStepIndex].decision = 'APPROVED';
      request.approvalHistory[historyStepIndex].date = new Date();
      request.approvalHistory[historyStepIndex].comment = commentaire;
      request.markModified('approvalHistory');

      const nextStep = request.approvalHistory.find(h => h.level > historyStep.level && h.decision === 'PENDING');
      
      if (nextStep) {
        request.currentApproverId = new Types.ObjectId(nextStep.approverId.toString());
        await this.notificationsService.sendToEmployee(
          request.employeeId.toString(),
          `✅ Validé par ${historyStep.approverName}`,
          `Votre demande est maintenant en attente de validation par ${nextStep.approverName}.`,
          NotificationType.HR_REQUEST,
        );
      } else {
        request.status = LeaveStatus.PENDING_RH;
        request.currentApproverId = null;
        await this.notificationsService.sendToEmployee(
          request.employeeId.toString(),
          `✅ Validation managers terminée`,
          `Votre demande de congé a passé l'étape manager. En attente de validation finale des RH.`,
          NotificationType.HR_REQUEST,
        );
      }
    } else {
      request.status = LeaveStatus.REJECTED;
      request.currentApproverId = null;
      request.approvalHistory[historyStepIndex].decision = 'REJECTED';
      request.approvalHistory[historyStepIndex].date = new Date();
      request.approvalHistory[historyStepIndex].comment = commentaire;
      request.markModified('approvalHistory');
      
      request.commentaire = commentaire;

      await this.notificationsService.sendToEmployee(
        request.employeeId.toString(),
        `❌ Congé refusé par ${historyStep.approverName}`,
        `Votre demande de congé a été refusée. ${commentaire}`,
        NotificationType.HR_REQUEST,
      );
    }

    return request.save();
  }

  async handleRhApproval(id: string, rhId: string, decision: 'APPROVED' | 'REJECTED', commentaire = '') {
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) throw new NotFoundException('Demande de congé introuvable');

    if (request.status !== LeaveStatus.PENDING_RH) {
      throw new BadRequestException(`Demande ne peut pas être traitée par la RH. Statut: ${request.status}`);
    }

    if (decision === 'APPROVED') {
      request.status = LeaveStatus.APPROVED;
      request.rhApprovedBy = new Types.ObjectId(rhId);
      request.rhApprovedAt = new Date();
      request.rhCommentaire = commentaire;
      request.validatedBy = new Types.ObjectId(rhId);
      request.validatedAt = new Date();

      const balance = await this.getOrCreateBalance(request.employeeId.toString());
      balance.soldeUtilise += request.nombreJours;
      await balance.save();

      const soldeDisponible = balance.soldeAnnuel - balance.soldeUtilise;
      await this.employeeModel.updateOne(
        { _id: request.employeeId },
        { $set: { soldeConges: soldeDisponible } }
      ).exec();

      await this.notificationsService.sendToEmployee(
        request.employeeId.toString(),
        '✅ Congé validé',
        `Votre demande de congé du ${request.dateDebut.toLocaleDateString('fr-FR')} est maintenant entièrement validée. Solde mis à jour.`,
        NotificationType.HR_REQUEST,
      );
    } else {
      request.status = LeaveStatus.REJECTED;
      request.rhCommentaire = commentaire;
      request.commentaire = commentaire;
      request.validatedBy = new Types.ObjectId(rhId);
      request.validatedAt = new Date();

      await this.notificationsService.sendToEmployee(
        request.employeeId.toString(),
        '❌ Congé refusé par les RH',
        `Votre demande de congé a été refusée par les RH. ${commentaire}`,
        NotificationType.HR_REQUEST,
      );
    }

    return request.save();
  }

  async getAllRequests(status?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.leaveRequestModel.find(filter).populate('employeeId', 'nom prenom matricule departement avatar').sort({ createdAt: -1 }).exec();

  }

  async getMyBalance(employeeId: string) {
    return this.getOrCreateBalance(employeeId);
  }

  async addMonthlyBalance(days = 7.5) {
    return this.leaveBalanceModel.updateMany({}, { $inc: { soldeAnnuel: days } }).exec();
  }

  async updateBalance(employeeId: string, days: number) {
    const balance = await this.getOrCreateBalance(employeeId);
    balance.soldeAnnuel = Math.round((balance.soldeAnnuel + days) * 100) / 100;
    await balance.save();
    return balance;
  }

  private async getOrCreateBalance(employeeId: string) {
    let balance = await this.leaveBalanceModel.findOne({ employeeId: new Types.ObjectId(employeeId) }).exec();
    if (!balance) {
      balance = await this.leaveBalanceModel.create({
        employeeId: new Types.ObjectId(employeeId),
        soldeAnnuel: 30,
        soldeUtilise: 0,
      });
    }
    return balance;
  }
}