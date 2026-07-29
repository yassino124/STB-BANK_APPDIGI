import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveRequest, LeaveBalance, LeaveStatus } from './schemas/leave.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { HierarchyService } from '../hierarchy/hierarchy.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalance>,
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

    const employee = await this.hierarchyService.buildForEmployee(employeeId);
    const managerId = employee.managerId;

    const createData: any = {
      employeeId: new Types.ObjectId(employeeId),
      type: dto.type as any,
      dateDebut,
      dateFin,
      nombreJours,
      motif: dto.motif,
      status: LeaveStatus.PENDING_N1,
    };
    if (managerId) {
      createData.managerId = new Types.ObjectId(managerId.toString());
    }

    return this.leaveRequestModel.create(createData);
  }

  async getMyRequests(employeeId: string) {
    return this.leaveRequestModel.find({ employeeId: new Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
  }

  async getPendingForManager(managerId: string) {
    return this.leaveRequestModel
      .find({
        managerId: new Types.ObjectId(managerId),
        status: LeaveStatus.PENDING_N1,
      })
      .populate('employeeId', 'nom prenom matricule poste department soldeConges')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getMyTeamRequests(managerId: string) {
    const directReports = await this.hierarchyService.getDirectReports(managerId);
    const reportIds = directReports.map((dr) => dr.employeeId);

    return this.leaveRequestModel
      .find({ employeeId: { $in: reportIds } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async handleManagerApproval(id: string, managerId: string, decision: 'APPROVED' | 'REJECTED', commentaire = '') {
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) throw new NotFoundException('Demande de congé introuvable');

    const isN1 = request.managerId?.toString() === managerId;
    if (!isN1) {
      throw new ForbiddenException('Vous n\'êtes pas le N+1 de cet employé');
    }

    if (request.status !== LeaveStatus.PENDING_N1) {
      throw new BadRequestException(`Demande déjà traitée. Statut actuel: ${request.status}`);
    }

    if (decision === 'APPROVED') {
      request.status = LeaveStatus.APPROVED_N1;
      request.n1ApprovedBy = new Types.ObjectId(managerId);
      request.n1ApprovedAt = new Date();
      request.n1Commentaire = commentaire;
      request.validatedBy = new Types.ObjectId(managerId);
      request.validatedAt = new Date();

      await this.notificationsService.sendToEmployee(
        request.employeeId.toString(),
        '✅ Congé approuvé par votre N+1',
        `Votre demande de congé du ${request.dateDebut.toLocaleDateString('fr-FR')} est approuvée par votre manager. En attente de validation RH.`,
        NotificationType.HR_REQUEST,
      );
    } else {
      request.status = LeaveStatus.REJECTED;
      request.n1Commentaire = commentaire;
      request.commentaire = commentaire;
      request.validatedBy = new Types.ObjectId(managerId);
      request.validatedAt = new Date();

      await this.notificationsService.sendToEmployee(
        request.employeeId.toString(),
        '❌ Congé refusé par votre manager',
        `Votre demande de congé a été refusée. ${commentaire}`,
        NotificationType.HR_REQUEST,
      );
    }

    return request.save();
  }

  async handleRhApproval(id: string, rhId: string, decision: 'APPROVED' | 'REJECTED', commentaire = '') {
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) throw new NotFoundException('Demande de congé introuvable');

    if (request.status !== LeaveStatus.PENDING_RH && request.status !== LeaveStatus.APPROVED_N1) {
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
    return this.leaveRequestModel.find(filter).populate('employeeId', 'nom prenom matricule departement').sort({ createdAt: -1 }).exec();
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
        soldeAnnuel: 90,
        soldeUtilise: 0,
      });
    }
    return balance;
  }
}