import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Avance, AvanceStatut, AvanceType } from './schemas/avance.schema';
import { Employee } from '../employees/employee.schema';
import { Account } from '../accounts/schemas/account.schema';
import { Transaction, TransactionType, TransactionStatus, TransactionCategory } from '../transactions/schemas/transaction.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class AvancesService {
  constructor(
    @InjectModel(Avance.name) private avanceModel: Model<Avance>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private notificationsService: NotificationsService,
  ) {}

  async create(employeeId: string, data: { type: AvanceType; montant: number; motif?: string }) {
    console.log('🔍 Creating avance for employeeId:', employeeId);
    
    const employee = await this.employeeModel.findById(employeeId).exec();
    console.log('✅ Employee found:', employee ? `${employee.prenom} ${employee.nom}` : 'NULL');
    
    if (!employee) {
      throw new NotFoundException('Employé introuvable');
    }

    // Validation: Max 50% du salaire pour avance salaire
    if (data.type === AvanceType.SALAIRE) {
      const maxAvance = employee.salaireBase * 0.5;
      if (data.montant > maxAvance) {
        throw new BadRequestException(
          `Montant trop élevé. Maximum autorisé: ${maxAvance.toFixed(2)} TND (50% du salaire)`
        );
      }
    }

    const avance = await this.avanceModel.create({
      employee: new Types.ObjectId(employeeId),
      type: data.type,
      montant: data.montant,
      motif: data.motif || null,
      statut: AvanceStatut.EN_ATTENTE,
    });

    // Notification à l'employé
    await this.notificationsService.sendToEmployee(
      employeeId,
      '✅ Demande d\'avance soumise',
      `Votre demande d'avance de ${data.montant} TND (${data.type}) a été envoyée pour validation.`,
      NotificationType.TRANSACTION,
    );

    return avance;
  }

  async getMyAvances(employeeId: string) {
    return this.avanceModel
      .find({ employee: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllAvances(filters?: { statut?: AvanceStatut; employeeId?: string }) {
    const query: any = {};
    
    if (filters?.statut) {
      query.statut = filters.statut;
    }
    
    if (filters?.employeeId) {
      query.employee = new Types.ObjectId(filters.employeeId);
    }

    return this.avanceModel
      .find(query)
      .populate('employee', 'matricule nom prenom email')
      .populate('approvedBy', 'nom prenom')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatut(
    avanceId: string,
    statut: AvanceStatut,
    approvedById?: string,
    rejectionReason?: string,
  ) {
    const avance = await this.avanceModel.findById(avanceId).exec();
    if (!avance) {
      throw new NotFoundException('Avance introuvable');
    }

    if (avance.statut !== AvanceStatut.EN_ATTENTE) {
      throw new BadRequestException('Cette avance a déjà été traitée');
    }

    avance.statut = statut;
    
    if (statut === AvanceStatut.APPROUVE && approvedById) {
      avance.approvedBy = new Types.ObjectId(approvedById);
      avance.approvedAt = new Date();
      
      // Mettre à jour employee.avancesEnCours
      await this.employeeModel.findByIdAndUpdate(avance.employee, {
        $inc: { avancesEnCours: avance.montant }
      }).exec();

      // CRÉDITER LE COMPTE - Ajouter l'avance au solde
      const account = await this.accountModel.findOne({
        employeeId: avance.employee,
        isPrimary: true,
      }).exec();

      if (account) {
        await this.accountModel.findByIdAndUpdate(account._id, {
          $inc: { solde: avance.montant }
        }).exec();

        // 🆕 CRÉER UNE TRANSACTION pour l'historique
        const reference = `AVN-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
        await this.transactionModel.create({
          employeeId: avance.employee,
          accountId: account._id,
          montant: avance.montant,
          type: TransactionType.AVANCE,
          description: `Avance ${avance.type} approuvée`,
          status: TransactionStatus.COMPLETED,
          date: new Date(),
          reference,
          category: TransactionCategory.INCOME,
          metadata: {
            avanceId: avance._id,
            avanceType: avance.type,
            motif: avance.motif,
          },
        });
      }
    }
    
    if (statut === AvanceStatut.REFUSE && rejectionReason) {
      avance.rejectionReason = rejectionReason;
    }

    await avance.save();

    // Notification à l'employé
    const employee = await this.employeeModel.findById(avance.employee).exec();
    if (employee) {
      const message = statut === AvanceStatut.APPROUVE
        ? `✅ Votre demande d'avance de ${avance.montant} TND a été approuvée. Le montant a été crédité sur votre compte.`
        : `❌ Votre demande d'avance de ${avance.montant} TND a été refusée. ${rejectionReason || ''}`;
      
      await this.notificationsService.sendToEmployee(
        avance.employee.toString(),
        statut === AvanceStatut.APPROUVE ? '✅ Avance approuvée' : '❌ Avance refusée',
        message,
        statut === AvanceStatut.APPROUVE ? NotificationType.SUCCESS : NotificationType.WARNING,
      );
    }

    return avance;
  }

  async markAsDebited(avanceId: string, transactionId?: string) {
    const avance = await this.avanceModel.findById(avanceId).exec();
    if (!avance) {
      throw new NotFoundException('Avance introuvable');
    }

    if (avance.statut !== AvanceStatut.APPROUVE) {
      throw new BadRequestException('Cette avance n\'est pas approuvée');
    }

    avance.statut = AvanceStatut.DEBITEE;
    avance.debitedAt = new Date();
    
    if (transactionId) {
      avance.transactionId = new Types.ObjectId(transactionId);
    }

    await avance.save();

    // Réinitialiser employee.avancesEnCours
    await this.employeeModel.findByIdAndUpdate(avance.employee, {
      $inc: { avancesEnCours: -avance.montant }
    }).exec();

    return avance;
  }

  async delete(avanceId: string, employeeId: string) {
    const avance = await this.avanceModel.findOne({
      _id: new Types.ObjectId(avanceId),
      employee: new Types.ObjectId(employeeId),
    }).exec();

    if (!avance) {
      throw new NotFoundException('Avance introuvable');
    }

    if (avance.statut !== AvanceStatut.EN_ATTENTE) {
      throw new BadRequestException('Seules les demandes en attente peuvent être annulées');
    }

    await this.avanceModel.findByIdAndDelete(avanceId).exec();

    await this.notificationsService.sendToEmployee(
      employeeId,
      'Demande annulée',
      `Votre demande d'avance de ${avance.montant} TND a été annulée.`,
      NotificationType.TRANSACTION,
    );

    return { success: true, message: 'Demande annulée' };
  }
}
