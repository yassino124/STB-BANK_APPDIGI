import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveRequest, LeaveBalance, LeaveStatus } from './schemas/leave.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { HierarchyService } from '../hierarchy/hierarchy.service';
import { Employee } from '../employees/employee.schema';
import { RulesService } from '../rules/rules.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalance>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    private notificationsService: NotificationsService,
    private hierarchyService: HierarchyService,
    private rulesService: RulesService,
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

    // Dynamic Workflow Engine
    // 1. First, check if there's a dynamic workflow defined
    let requiredApprovers = this.rulesService.getRule('leave.workflow', null);
    
    // 2. Fallback to old Policies engine if no workflow exists
    if (!requiredApprovers) {
      requiredApprovers = this.rulesService.evaluatePolicy('leave', { days: nombreJours });
    }

    let level = 1;
    
    for (const role of requiredApprovers) {
      if (role === 'MANAGER' && employee.managerId) {
        const manager: any = employee.managerId;
        approvalChain.push(manager._id.toString());
        approvalHistory.push({ approverId: manager._id, approverRole: 'MANAGER', approverName: `${manager.nom} ${manager.prenom}`, level: level++, decision: 'PENDING' });
      } else if (role === 'DIRECTOR' && employee.directorId) {
        const director: any = employee.directorId;
        approvalChain.push(director._id.toString());
        approvalHistory.push({ approverId: director._id, approverRole: 'DIRECTOR', approverName: `${director.nom} ${director.prenom}`, level: level++, decision: 'PENDING' });
      } else if (role === 'DG' && employee.centralDirectorId) {
        const dg: any = employee.centralDirectorId;
        approvalChain.push(dg._id.toString());
        approvalHistory.push({ approverId: dg._id, approverRole: 'DG', approverName: `${dg.nom} ${dg.prenom}`, level: level++, decision: 'PENDING' });
      } else if (role === 'RH' || role === 'FINANCE') {
        // Group queue (any RH/Finance can approve)
        approvalHistory.push({ approverId: null, approverRole: role, approverName: `Équipe ${role}`, level: level++, decision: 'PENDING' });
      }
    }

    // Fallback: Never auto-approve if no managers were found. Route to RH instead.
    if (approvalHistory.length === 0) {
      approvalHistory.push({ approverId: null, approverRole: 'RH', approverName: 'Équipe RH (Fallback)', level: 1, decision: 'PENDING' });
    }

    const firstStep = approvalHistory[0];
    let initialStatus = LeaveStatus.PENDING_MANAGER;
    if (firstStep.approverRole === 'RH') {
      initialStatus = LeaveStatus.PENDING_RH;
    }

    const initialApproverId = firstStep.approverId ? new Types.ObjectId(firstStep.approverId) : null;
    const initialApproverRole = !firstStep.approverId ? firstStep.approverRole : null;

    const createData: any = {
      employeeId: new Types.ObjectId(employeeId),
      type: dto.type as any,
      dateDebut,
      dateFin,
      nombreJours,
      motif: dto.motif,
      status: initialStatus,
      currentApproverId: initialApproverId,
      currentApproverRole: initialApproverRole,
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

  async processApproval(id: string, userId: string, userRoles: string[], decision: 'APPROVED' | 'REJECTED', commentaire = '') {
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) throw new NotFoundException('Demande de congé introuvable');

    if (request.status === LeaveStatus.APPROVED || request.status === LeaveStatus.REJECTED) {
      throw new BadRequestException(`Demande déjà traitée (Statut: ${request.status})`);
    }

    // Find the current pending step in the workflow
    const historyStepIndex = request.approvalHistory.findIndex(h => h.decision === 'PENDING');
    if (historyStepIndex === -1) {
      throw new BadRequestException('Aucune étape en attente pour cette demande');
    }
    const historyStep = request.approvalHistory[historyStepIndex];

    // Authorization Check
    const isDirectApprover = historyStep.approverId && historyStep.approverId.toString() === userId;
    const isRoleApprover = !historyStep.approverId && historyStep.approverRole && userRoles.includes(historyStep.approverRole);
    const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

    if (!isDirectApprover && !isRoleApprover && !isSuperAdmin) {
      throw new ForbiddenException(`Vous n'êtes pas autorisé à valider cette étape (Requise: ${historyStep.approverRole || historyStep.approverName})`);
    }

    // Process Decision
    request.approvalHistory[historyStepIndex].decision = decision;
    request.approvalHistory[historyStepIndex].date = new Date();
    request.approvalHistory[historyStepIndex].comment = commentaire;
    
    // If a generic role approved it, record who actually did it
    if (!historyStep.approverId) {
       const user = await this.employeeModel.findById(userId).select('nom prenom').exec();
       if (user) {
         request.approvalHistory[historyStepIndex].approverName = `${user.nom} ${user.prenom} (Équipe ${historyStep.approverRole})`;
         request.approvalHistory[historyStepIndex].approverId = new Types.ObjectId(userId);
       }
    }
    request.markModified('approvalHistory');

    if (decision === 'APPROVED') {
      const nextStep = request.approvalHistory.find(h => h.level > historyStep.level && h.decision === 'PENDING');
      
      if (nextStep) {
        request.currentApproverId = nextStep.approverId ? new Types.ObjectId(nextStep.approverId.toString()) : null;
        request.currentApproverRole = !nextStep.approverId ? nextStep.approverRole : null;
        
        // Ensure status reflects the current queue (for backward compatibility on frontend)
        if (nextStep.approverRole === 'RH' || nextStep.approverRole === 'FINANCE') {
          request.status = LeaveStatus.PENDING_RH;
        } else {
          request.status = LeaveStatus.PENDING_MANAGER;
        }

        await this.notificationsService.sendToEmployee(
          request.employeeId.toString(),
          `✅ Validé (Étape ${historyStep.level})`,
          `Votre demande a passé l'étape ${historyStep.level}. En attente de : ${nextStep.approverName}.`,
          NotificationType.HR_REQUEST,
        );
      } else {
        // Workflow completed successfully !
        request.status = LeaveStatus.APPROVED;
        request.currentApproverId = null;
        request.currentApproverRole = null;
        request.validatedBy = new Types.ObjectId(userId);
        request.validatedAt = new Date();

        // Deduct balance
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
          '✅ Congé entièrement validé',
          `Votre demande de congé du ${request.dateDebut.toLocaleDateString('fr-FR')} est validée. Solde mis à jour.`,
          NotificationType.HR_REQUEST,
        );
      }
    } else {
      // Workflow rejected
      request.status = LeaveStatus.REJECTED;
      request.currentApproverId = null;
      request.currentApproverRole = null;
      request.commentaire = commentaire;

      await this.notificationsService.sendToEmployee(
        request.employeeId.toString(),
        `❌ Congé refusé à l'étape ${historyStep.level}`,
        `Votre demande de congé a été refusée. ${commentaire}`,
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
      const maxDays = this.rulesService.getRule('leave.maxDays', 30);
      balance = await this.leaveBalanceModel.create({
        employeeId: new Types.ObjectId(employeeId),
        soldeAnnuel: maxDays,
        soldeUtilise: 0,
      });
    }
    return balance;
  }
}