import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Prime, PrimeStatus } from './schemas/prime.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class PrimesService {
  constructor(
    @InjectModel(Prime.name) private primeModel: Model<Prime>,
    @InjectModel('Account') private accountModel: Model<any>,
    @InjectModel('Employee') private employeeModel: Model<any>,
    @InjectModel('Transaction') private transactionModel: Model<any>,
    private notificationsService: NotificationsService,
  ) {}

  // ── Employee: demander une prime (passe par validation RH) ──────────────────
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

  // ── Finance/Admin: attribuer prime individuelle → créditée directement ───────
  async adminCreate(
    approverId: string,
    dto: { employeeId: string; type: string; montant: number; description: string },
  ) {
    const emp = await this.employeeModel.findById(dto.employeeId).lean().exec() as any;
    if (!emp) throw new NotFoundException('Employé introuvable');

    const account = await this.accountModel.findOne({ employeeId: new Types.ObjectId(dto.employeeId) }).exec();

    // Create prime record (PAID immediately)
    const prime = await this.primeModel.create({
      employeeId: new Types.ObjectId(dto.employeeId),
      type: dto.type as any,
      montant: dto.montant,
      description: dto.description || `Prime ${dto.type} attribuée par la Finance`,
      status: PrimeStatus.PAID,
      approvedBy: new Types.ObjectId(approverId),
      approvedAt: new Date(),
    });

    // Credit account if exists
    if (account) {
      await this.accountModel.findByIdAndUpdate(account._id, { $inc: { solde: dto.montant } });
      await this.transactionModel.create({
        employeeId: new Types.ObjectId(dto.employeeId),
        accountId: account._id,
        montant: dto.montant,
        type: 'PRIME',
        category: 'OTHER',
        description: dto.description || `Prime ${dto.type}`,
        status: 'COMPLETED',
        reference: `PRM-${Date.now()}`,
        date: new Date(),
      });
      // Sync employee.compteSolde
      await this.employeeModel.updateOne(
        { _id: new Types.ObjectId(dto.employeeId) },
        { $inc: { compteSolde: dto.montant, totalPrimes: dto.montant } },
      );
    }

    // Push notification
    await this.notificationsService.sendToEmployee(
      dto.employeeId,
      '🎉 Prime créditée sur votre compte',
      `Votre prime de ${dto.montant} TND (${dto.type}) a été créditée directement sur votre compte STB.`,
      NotificationType.HR_REQUEST,
    );

    return {
      success: true,
      prime,
      credited: !!account,
      message: account
        ? `Prime de ${dto.montant} TND créditée sur le compte de ${emp.prenom} ${emp.nom}`
        : `Prime enregistrée mais aucun compte trouvé pour ${emp.prenom} ${emp.nom}`,
    };
  }

  // ── Finance/Admin: distribuer prime à TOUS les employés actifs ───────────────
  async distributeToAll(
    approverId: string,
    dto: { type: string; montant: number; description: string },
  ) {
    const employees = await this.employeeModel.find({ status: 'ACTIVE' }).lean().exec() as any[];
    const results: any[] = [];
    let credited = 0;
    let errors = 0;

    for (const emp of employees) {
      try {
        const account = await this.accountModel.findOne({ employeeId: emp._id }).exec();

        const prime = await this.primeModel.create({
          employeeId: emp._id,
          type: dto.type as any,
          montant: dto.montant,
          description: dto.description || `Prime ${dto.type} — distribution Finance`,
          status: PrimeStatus.PAID,
          approvedBy: new Types.ObjectId(approverId),
          approvedAt: new Date(),
        });

        if (account) {
          await this.accountModel.findByIdAndUpdate(account._id, { $inc: { solde: dto.montant } });
          await this.transactionModel.create({
            employeeId: emp._id,
            accountId: account._id,
            montant: dto.montant,
            type: 'PRIME',
            category: 'OTHER',
            description: dto.description || `Prime ${dto.type}`,
            status: 'COMPLETED',
            reference: `PRM-${Date.now()}-${emp.matricule}`,
            date: new Date(),
          });
          await this.employeeModel.updateOne(
            { _id: emp._id },
            { $inc: { compteSolde: dto.montant, totalPrimes: dto.montant } },
          );
          credited++;
        }

        await this.notificationsService.sendToEmployee(
          emp._id.toString(),
          '🎉 Prime créditée sur votre compte',
          `Votre prime de ${dto.montant} TND (${dto.type}) a été créditée sur votre compte STB.`,
          NotificationType.HR_REQUEST,
        );

        results.push({ matricule: emp.matricule, nom: `${emp.prenom} ${emp.nom}`, credited: !!account, primeId: prime._id });
      } catch (err) {
        errors++;
        results.push({ matricule: emp.matricule, error: err.message });
      }
    }

    return {
      success: true,
      total: employees.length,
      credited,
      errors,
      montantTotal: credited * dto.montant,
      results,
    };
  }

  async getMyPrimes(employeeId: string) {
    return this.primeModel.find({ employeeId: new Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
  }

  async getAllPrimes(status?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.primeModel.find(filter).populate('employeeId', 'nom prenom matricule avatar').sort({ createdAt: -1 }).exec();
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
