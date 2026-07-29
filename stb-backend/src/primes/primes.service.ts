import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Prime, PrimeStatus } from './schemas/prime.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class PrimesService {
  constructor(
    @InjectModel(Prime.name) private primeModel: Model<Prime>,
    private notificationsService: NotificationsService,
  ) {}

  async create(employeeId: string, dto: { type: string; montant: number; description: string }) {
    const existing = await this.primeModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      type: dto.type as any,
      status: PrimeStatus.PENDING,
    }).exec();
    
    if (existing) {
      throw new BadRequestException('Vous avez déjà une demande de prime en cours pour ce type.');
    }

    return this.primeModel.create({
      employeeId: new Types.ObjectId(employeeId),
      type: dto.type as any,
      montant: dto.montant,
      description: dto.description,
      status: PrimeStatus.PENDING,
    });
  }

  async getMyPrimes(employeeId: string) {
    return this.primeModel.find({ employeeId: new Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
  }

  async getAllPrimes(status?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.primeModel.find(filter).populate('employeeId', 'nom prenom matricule').sort({ createdAt: -1 }).exec();
  }

  async handle(id: string, approverId: string, decision: 'APPROVED' | 'REJECTED') {
    const prime = await this.primeModel.findById(id).exec();
    if (!prime) throw new Error('Prime introuvable');
    prime.status = decision === 'APPROVED' ? PrimeStatus.APPROVED : PrimeStatus.REJECTED;
    prime.approvedBy = new Types.ObjectId(approverId);
    prime.approvedAt = new Date();
    await prime.save();

    await this.notificationsService.sendToEmployee(
      prime.employeeId.toString(),
      decision === 'APPROVED' ? '🎉 Prime approuvée' : '❌ Prime refusée',
      decision === 'APPROVED'
        ? `Votre prime de ${prime.montant} TND a été approuvée!`
        : 'Votre demande de prime a été refusée.',
      NotificationType.HR_REQUEST,
    );

    return prime;
  }
}
