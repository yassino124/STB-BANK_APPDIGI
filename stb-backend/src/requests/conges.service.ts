import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conge, CongeType, CongeStatus, CONGE_RULES } from './schemas/conge.schema';
import { Employee } from '../employees/employee.schema';
import { Account } from '../accounts/schemas/account.schema';
import { Transaction, TransactionType, TransactionStatus, TransactionCategory } from '../transactions/schemas/transaction.schema';
import { EmployeeStatus } from '../common/enums/employee-status.enum';

@Injectable()
export class CongesService {
  constructor(
    @InjectModel(Conge.name) private congeModel: Model<Conge>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  /**
   * Créer demande de congé avec validation automatique
   */
  async createCongeRequest(
    employeeId: string,
    type: CongeType,
    startDate: Date,
    endDate: Date,
    motif?: string,
  ): Promise<Conge> {
    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    // Calculer durée
    const dureeDays = this.calculateDuration(startDate, endDate);
    
    // Valider selon type
    await this.validateCongeRequest(employee, type, dureeDays);

    // Créer congé
    const conge = new this.congeModel({
      employeeId: new Types.ObjectId(employeeId),
      type,
      status: CongeStatus.EN_ATTENTE,
      startDate,
      endDate,
      dureeDays,
      motif: motif || `Congé ${type}`,
      approvals: {},
    });

    await conge.save();

    return conge;
  }

  /**
   * Validation selon type de congé
   */
  private async validateCongeRequest(
    employee: any,
    type: CongeType,
    dureeDays: number,
  ): Promise<void> {
    const rules = CONGE_RULES[type];

    // Vérifier durée max
    if (rules.dureeMax && dureeDays > rules.dureeMax) {
      throw new BadRequestException(
        `Durée maximale pour ${type}: ${rules.dureeMax} jours`,
      );
    }

    // Vérifier solde si décompté
    if (rules.deductFromSolde && employee.soldeConges < dureeDays) {
      throw new BadRequestException(
        `Solde insuffisant. Disponible: ${employee.soldeConges} jours, Demandé: ${dureeDays} jours`,
      );
    }

    // Vérifier limite carrière
    if (rules.limiteCarriere) {
      const count = await this.congeModel.countDocuments({
        employeeId: new Types.ObjectId(employee._id),
        type,
        countedInCarrierLimit: true,
        status: { $in: [CongeStatus.APPROUVE] },
      });

      if (count >= rules.limiteCarriere) {
        throw new BadRequestException(
          `Limite carrière atteinte pour ${type}: ${rules.limiteCarriere} fois maximum`,
        );
      }
    }
  }

  /**
   * Calculer durée en jours ouvrables
   */
  private calculateDuration(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let days = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Exclure weekend (samedi=6, dimanche=0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  /**
   * Approuver congé (simplifié - direct approval)
   */
  async approveConge(
    congeId: string,
    approverId: string,
    role: 'MANAGER' | 'RH' | 'DG',
  ): Promise<Conge> {
    const conge = await this.congeModel.findById(congeId).populate('employeeId');
    if (!conge) {
      throw new NotFoundException('Congé non trouvé');
    }

    if (conge.status !== CongeStatus.EN_ATTENTE) {
      throw new BadRequestException('Ce congé a déjà été traité');
    }

    const employee = conge.employeeId as any;
    const rules = CONGE_RULES[conge.type];

    // Simple approval - direct status change
    conge.status = CongeStatus.APPROUVE;
    conge.approvals = {
      rh: {
        approved: true,
        date: new Date(),
        rhId: new Types.ObjectId(approverId),
      }
    };

    await this.deductSolde(employee, conge);
    await conge.save();

    // 🆕 CRÉER UNE TRANSACTION pour l'historique
    const account = await this.accountModel.findOne({
      employeeId: employee._id,
      isPrimary: true,
    }).exec();

    if (account) {
      const reference = `CNG-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
      await this.transactionModel.create({
        employeeId: employee._id,
        accountId: account._id,
        montant: 0, // Congé n'a pas de montant
        type: TransactionType.CONGE,
        description: `Congé ${conge.type} approuvé (${conge.dureeDays} jours)`,
        status: TransactionStatus.COMPLETED,
        date: new Date(),
        reference,
        category: TransactionCategory.OTHER,
        metadata: {
          congeId: conge._id,
          congeType: conge.type,
          startDate: conge.startDate,
          endDate: conge.endDate,
          dureeDays: conge.dureeDays,
          motif: conge.motif,
        },
      });
    }
    
    return conge;
  }

  /**
   * Déduire solde si nécessaire
   */
  private async deductSolde(employee: any, conge: Conge): Promise<void> {
    const rules = CONGE_RULES[conge.type];

    if (rules.deductFromSolde) {
      const newSolde = Math.max(0, employee.soldeConges - conge.dureeDays);
      await this.employeeModel.findByIdAndUpdate(employee._id, {
        soldeConges: newSolde,
      });
    }

    // Marquer pour limite carrière si applicable
    if (rules.limiteCarriere) {
      conge.countedInCarrierLimit = true;
    }
  }

  /**
   * Refuser congé
   */
  async refuseConge(congeId: string, reason: string): Promise<Conge> {
    const conge = await this.congeModel.findById(congeId);
    if (!conge) {
      throw new NotFoundException('Congé non trouvé');
    }

    if (conge.status !== CongeStatus.EN_ATTENTE) {
      throw new BadRequestException('Ce congé a déjà été traité');
    }

    conge.status = CongeStatus.REFUSE;
    conge.refusalReason = reason;
    await conge.save();

    return conge;
  }

  /**
   * Upload justificatif
   */
  async uploadJustificatif(
    congeId: string,
    file: { filename: string; url: string; mimetype: string },
  ): Promise<Conge> {
    const conge = await this.congeModel.findById(congeId);
    if (!conge) {
      throw new NotFoundException('Congé non trouvé');
    }

    conge.justificatif = {
      filename: file.filename,
      url: file.url,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
    };

    // Auto-approve si certificat médical PDF valide
    if (
      conge.type === CongeType.MALADIE &&
      file.mimetype === 'application/pdf' &&
      conge.status === CongeStatus.EN_ATTENTE
    ) {
      conge.status = CongeStatus.APPROUVE;
      const employee = await this.employeeModel.findById(conge.employeeId);
      if (employee) {
        await this.deductSolde(employee, conge);
      }
    }

    await conge.save();
    return conge;
  }

  /**
   * Mes congés
   */
  async getMyConges(employeeId: string): Promise<Conge[]> {
    return this.congeModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Tous les congés (RH/Admin) avec filtres
   */
  async getAllConges(filters?: { statut?: string; employeeId?: string }): Promise<Conge[]> {
    const query: any = {};
    
    if (filters?.statut) {
      query.status = filters.statut;
    }
    
    if (filters?.employeeId) {
      query.employeeId = new Types.ObjectId(filters.employeeId);
    }

    return this.congeModel
      .find(query)
      .populate('employeeId', 'matricule nom prenom email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Demandes EN_ATTENTE des subordonnés directs d'un manager
   */
  async getPendingTeam(managerId: string): Promise<Conge[]> {
    // Trouver tous les employés qui ont ce manager
    const teamMembers = await this.employeeModel
      .find({ managerId: new Types.ObjectId(managerId) })
      .select('_id');

    const teamIds = teamMembers.map((e) => e._id);

    return this.congeModel
      .find({
        employeeId: { $in: teamIds },
        status: CongeStatus.EN_ATTENTE,
      })
      .populate('employeeId', 'matricule nom prenom email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Calendrier équipe (pour managers)
   */
  async getTeamCalendar(
    managerId: string,
    month: number,
    year: number,
  ): Promise<Conge[]> {
    // Trouver employés du manager
    const teamMembers = await this.employeeModel
      .find({ managerId: new Types.ObjectId(managerId) })
      .select('_id');

    const teamIds = teamMembers.map((e) => e._id);

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    return this.congeModel
      .find({
        employeeId: { $in: teamIds },
        status: CongeStatus.APPROUVE,
        $or: [
          { startDate: { $lte: endOfMonth }, endDate: { $gte: startOfMonth } },
        ],
      })
      .populate('employeeId', 'prenom nom avatar')
      .sort({ startDate: 1 })
      .exec();
  }

  /**
   * Report solde fin d'année (Cron 1er janvier)
   */
  async handleYearEndConges(): Promise<void> {
    const employees = await this.employeeModel.find({ status: EmployeeStatus.ACTIVE }).exec();

    for (const emp of employees) {
      const soldeRestant = emp.soldeConges;
      const reportMax = 15; // Max 15 jours reportables

      const soldeReporte = Math.min(soldeRestant, reportMax);
      const soldePerte = soldeRestant - soldeReporte;

      // Nouveau solde = base (90) + reporté
      const newSolde = 90 + soldeReporte;
      
      // Sauvegarder metadata pour historique
      const newMetadata = {
        ...(emp.metadata || {}),
        lastYearReport: {
          year: new Date().getFullYear() - 1,
          soldeReporte,
          soldePerte,
          date: new Date(),
        },
      };

      await this.employeeModel.findByIdAndUpdate(emp._id, {
        soldeConges: newSolde,
        metadata: newMetadata,
      });

      // TODO: Send notification if soldePerte > 0
    }
  }
}
