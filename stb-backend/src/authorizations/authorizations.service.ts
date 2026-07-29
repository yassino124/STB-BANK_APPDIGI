import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Authorization, AuthorizationStatus } from './schemas/authorization.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class AuthorizationsService {
  constructor(
    @InjectModel(Authorization.name) private authModel: Model<Authorization>,
    private notificationsService: NotificationsService,
  ) {}

  async create(employeeId: string, dto: { type: string; date: string; heureDebut?: string; heureFin?: string; motif?: string }) {
    return this.authModel.create({ employeeId: new Types.ObjectId(employeeId), ...dto, type: (dto as any).type as any, status: AuthorizationStatus.PENDING });
  }

  async getMine(employeeId: string) {
    return this.authModel.find({ employeeId: new Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
  }

  async getAll(status?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.authModel.find(filter).populate('employeeId', 'nom prenom matricule').sort({ createdAt: -1 }).exec();
  }

  async handle(id: string, approverId: string, decision: 'APPROVED' | 'REJECTED', commentaire = '') {
    const auth = await this.authModel.findById(id).exec();
    if (!auth) throw new Error('Authorization introuvable');
    auth.status = decision === 'APPROVED' ? AuthorizationStatus.APPROVED : AuthorizationStatus.REJECTED;
    auth.approvedBy = new Types.ObjectId(approverId);
    auth.commentaire = commentaire;
    await auth.save();
    await this.notificationsService.sendToEmployee(
      auth.employeeId.toString(),
      decision === 'APPROVED' ? '✅ Autorisation approuvée' : '❌ Autorisation refusée',
      `Votre demande d'autorisation a été ${decision === 'APPROVED' ? 'approuvée' : 'refusée'}.`,
      NotificationType.HR_REQUEST,
    );
    return auth;
  }
}
