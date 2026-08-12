import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Credit, CreditPayment, CreditStatus } from './schemas/credit.schema';
import { Account } from '../accounts/schemas/account.schema';
import { Employee } from '../employees/employee.schema';
import { Transaction, TransactionType, TransactionStatus, TransactionCategory } from '../transactions/schemas/transaction.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { RulesService } from '../rules/rules.service';
import { StringUtil } from '../common/utils/string.util';

@Injectable()
export class CreditsService {
  constructor(
    @InjectModel(Credit.name) private creditModel: Model<Credit>,
    @InjectModel(CreditPayment.name) private paymentModel: Model<CreditPayment>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private notificationsService: NotificationsService,
    private rulesService: RulesService,
  ) {}

  async create(employeeId: string, data: { title: string; type: string; montantInitial: number; tauxInteret: number; nombreMois: number; dateDebut: Date }) {
    const employee = await this.employeeModel.findById(employeeId).exec();
    if (!employee) throw new NotFoundException('Employé introuvable');

    const formula = this.rulesService.getRule('credit.formula', 'salary * 6');
    const maxCredit = this.rulesService.evaluateFormula(formula, { salary: employee.salaireBase || 1000 });

    if (data.montantInitial > maxCredit) {
      throw new BadRequestException(
        `Montant du crédit trop élevé. Le maximum autorisé selon votre profil est de ${maxCredit.toFixed(2)} TND.`
      );
    }

    const { montantInitial, tauxInteret, nombreMois, dateDebut } = data;
    // Calculate monthly payment: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const r = tauxInteret / 100 / 12;
    const mensualite = r === 0 ? montantInitial / nombreMois : Math.round(montantInitial * r * Math.pow(1 + r, nombreMois) / (Math.pow(1 + r, nombreMois) - 1) * 100) / 100;

    const dateDebutDate = new Date(dateDebut);
    const dateFin = new Date(dateDebutDate);
    dateFin.setMonth(dateFin.getMonth() + nombreMois);

    const credit = await this.creditModel.create({
      employeeId: new Types.ObjectId(employeeId),
      title: data.title,
      type: data.type as any,
      montantInitial,
      montantRestant: montantInitial,
      tauxInteret,
      mensualite,
      nombreMois,
      dateDebut: dateDebutDate,
      dateFin,
      status: CreditStatus.ACTIVE,
    });
    
    await this.employeeModel.findByIdAndUpdate(employeeId, {
      $inc: { creditsEnCours: montantInitial }
    });
    
    return credit;
  }

  async getMyCredits(employeeId: string) {
    return this.creditModel.find({ employeeId: new Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
  }

  async getAllCredits() {
    return this.creditModel.find().populate('employeeId', 'nom prenom matricule avatar').sort({ createdAt: -1 }).exec();
  }

  async processLatePaymentPenalties() {
    // Trouver tous les crédits en retard (LATE status)
    const lateCredits = await this.creditModel.find({ status: CreditStatus.LATE }).exec();
    const results: any[] = [];
    
    for (const credit of lateCredits) {
      try {
        // Calculer pénalité: 5% de la mensualité
        const penalite = Math.round(credit.mensualite * 0.05 * 100) / 100;
        
        // Ajouter pénalité au montant restant
        credit.montantRestant = Math.round((credit.montantRestant + penalite) * 100) / 100;
        await credit.save();
        
        // Créer enregistrement de pénalité
        await this.paymentModel.create({
          creditId: credit._id,
          employeeId: credit.employeeId,
          montant: penalite,
          capital: 0,
          interets: 0,
          montantRestantApres: credit.montantRestant,
          datePaiement: new Date(),
          mode: 'PENALTY',
          isLate: true,
          penalite: penalite,
        });
        
        // Notification
        await this.notificationsService.sendToEmployee(
          credit.employeeId.toString(),
          '⚠️ Pénalité de retard appliquée',
          `Une pénalité de ${penalite.toFixed(2)} TND a été appliquée à votre crédit ${credit.title} pour paiement en retard. Nouveau solde: ${credit.montantRestant.toFixed(2)} TND`,
          NotificationType.WARNING,
        );
        
        results.push({
          creditId: credit._id,
          penalite,
          nouveauSolde: credit.montantRestant,
        });
        
      } catch (e) {
        results.push({
          creditId: credit._id,
          error: e.message,
        });
      }
    }
    
    return results;
  }

  async retryLatePayment(creditId: string) {
    const credit = await this.creditModel.findById(creditId).exec();
    if (!credit) throw new NotFoundException('Crédit introuvable');
    if (credit.status !== CreditStatus.LATE) {
      throw new BadRequestException('Ce crédit n\'est pas en retard');
    }
    
    // Trouver le compte
    const account = await this.accountModel.findOne({ employeeId: credit.employeeId }).exec();
    if (!account) throw new NotFoundException('Compte bancaire introuvable');
    
    // Calculer capital et intérêts
    const tauxMensuel = credit.tauxInteret / 100 / 12;
    const interetsMois = Math.round(credit.montantRestant * tauxMensuel * 100) / 100;
    const mensualiteActuelle = Math.min(credit.mensualite, credit.montantRestant + interetsMois);
    const capitalRembourse = Math.round((mensualiteActuelle - interetsMois) * 100) / 100;
    
    // Vérifier solde
    if (account.solde < mensualiteActuelle) {
      throw new BadRequestException(`Solde toujours insuffisant. Requis: ${mensualiteActuelle.toFixed(2)} TND, Disponible: ${account.solde.toFixed(2)} TND`);
    }
    
    // Débiter compte
    await this.accountModel.findByIdAndUpdate(account._id, {
      $inc: { solde: -mensualiteActuelle }
    }).exec();
    
    // Créer transaction
    const reference = StringUtil.generateReference('CRD');
    const transaction = await this.transactionModel.create({
      employeeId: credit.employeeId,
      accountId: account._id,
      montant: mensualiteActuelle,
      type: TransactionType.CREDIT_PAYMENT,
      category: TransactionCategory.CREDIT,
      description: `Régularisation crédit ${credit.title} (retard)`,
      status: TransactionStatus.COMPLETED,
      reference,
      date: new Date(),
      metadata: {
        creditId: credit._id.toString(),
        capital: capitalRembourse,
        interets: interetsMois,
        wasLate: true,
      }
    });
    
    // Mise à jour crédit
    const nouveauRestant = Math.max(0, Math.round((credit.montantRestant - capitalRembourse) * 100) / 100);
    credit.montantRestant = nouveauRestant;
    credit.status = nouveauRestant <= 0 ? CreditStatus.CLOSED : CreditStatus.ACTIVE; // Retour à ACTIVE
    await credit.save();
    
    // Enregistrer paiement
    await this.paymentModel.create({
      creditId: credit._id,
      employeeId: credit.employeeId,
      montant: mensualiteActuelle,
      capital: capitalRembourse,
      interets: interetsMois,
      montantRestantApres: nouveauRestant,
      datePaiement: new Date(),
      mode: 'LATE_RETRY',
      transactionId: transaction._id,
      isLate: false,
      penalite: 0,
    });
    
    // Notification
    await this.notificationsService.sendToEmployee(
      credit.employeeId.toString(),
      '✅ Paiement régularisé',
      `Votre paiement en retard a été régularisé. Mensualité: ${mensualiteActuelle.toFixed(2)} TND. Reste: ${nouveauRestant.toFixed(2)} TND`,
      NotificationType.SUCCESS,
    );
    
    return {
      success: true,
      mensualite: mensualiteActuelle,
      capital: capitalRembourse,
      interets: interetsMois,
      reste: nouveauRestant,
      status: credit.status,
    };
  }

  async calculateEarlyRepayment(creditId: string) {
    const credit = await this.creditModel.findById(creditId).exec();
    if (!credit) throw new NotFoundException('Crédit introuvable');
    if (credit.status === CreditStatus.CLOSED) {
      throw new BadRequestException('Ce crédit est déjà soldé');
    }
    
    // Calculer le nombre de mois restants
    const now = new Date();
    const dateFin = new Date(credit.dateFin);
    const moisRestants = Math.max(0, Math.round((dateFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    // Calculer intérêts restants théoriques (si on continue normalement)
    const tauxMensuel = credit.tauxInteret / 100 / 12;
    let interetsRestantsTheoriques = 0;
    let montantTemp = credit.montantRestant;
    
    for (let i = 0; i < moisRestants && montantTemp > 0; i++) {
      const interetsMois = Math.round(montantTemp * tauxMensuel * 100) / 100;
      interetsRestantsTheoriques += interetsMois;
      const capitalMois = Math.min(credit.mensualite - interetsMois, montantTemp);
      montantTemp -= capitalMois;
    }
    
    // Économie d'intérêts si remboursement anticipé (on ne paie que le capital restant)
    const economieInterets = Math.round(interetsRestantsTheoriques * 100) / 100;
    
    // Frais de remboursement anticipé: 1% du capital restant (comme les banques)
    const fraisRemboursement = Math.round(credit.montantRestant * 0.01 * 100) / 100;
    
    // Montant total à payer = capital restant + frais
    const montantTotal = Math.round((credit.montantRestant + fraisRemboursement) * 100) / 100;
    
    return {
      creditId: credit._id,
      title: credit.title,
      capitalRestant: credit.montantRestant,
      moisRestants,
      economieInterets,
      fraisRemboursement,
      montantTotal,
      economieNette: Math.round((economieInterets - fraisRemboursement) * 100) / 100,
    };
  }

  async performEarlyRepayment(creditId: string) {
    const credit = await this.creditModel.findById(creditId).exec();
    if (!credit) throw new NotFoundException('Crédit introuvable');
    if (credit.status === CreditStatus.CLOSED) {
      throw new BadRequestException('Ce crédit est déjà soldé');
    }
    
    // Trouver le compte
    const account = await this.accountModel.findOne({ employeeId: credit.employeeId }).exec();
    if (!account) throw new NotFoundException('Compte bancaire introuvable');
    
    // Calculer montant de remboursement anticipé
    const calculation = await this.calculateEarlyRepayment(creditId);
    const montantTotal = calculation.montantTotal;
    
    // Vérifier solde
    if (account.solde < montantTotal) {
      throw new BadRequestException(
        `Solde insuffisant pour remboursement anticipé. Requis: ${montantTotal.toFixed(2)} TND, Disponible: ${account.solde.toFixed(2)} TND`
      );
    }
    
    // Débiter compte
    await this.accountModel.findByIdAndUpdate(account._id, {
      $inc: { solde: -montantTotal }
    }).exec();
    
    // Créer transaction
    const reference = StringUtil.generateReference('CRD');
    const transaction = await this.transactionModel.create({
      employeeId: credit.employeeId,
      accountId: account._id,
      montant: montantTotal,
      type: TransactionType.CREDIT_PAYMENT,
      category: TransactionCategory.CREDIT,
      description: `Remboursement anticipé crédit ${credit.title}`,
      status: TransactionStatus.COMPLETED,
      reference,
      date: new Date(),
      metadata: {
        creditId: credit._id.toString(),
        capital: credit.montantRestant,
        interets: 0,
        fraisRemboursement: calculation.fraisRemboursement,
        economieInterets: calculation.economieInterets,
        isEarlyRepayment: true,
      }
    });
    
    // Solder le crédit
    const capitalRembourse = credit.montantRestant;
    credit.montantRestant = 0;
    credit.status = CreditStatus.CLOSED;
    await credit.save();
    
    // Enregistrer paiement
    await this.paymentModel.create({
      creditId: credit._id,
      employeeId: credit.employeeId,
      montant: montantTotal,
      capital: capitalRembourse,
      interets: 0,
      montantRestantApres: 0,
      datePaiement: new Date(),
      mode: 'EARLY_REPAYMENT',
      transactionId: transaction._id,
      isLate: false,
      penalite: calculation.fraisRemboursement,
    });
    
    // Mettre à jour Employee.creditsEnCours
    await this.employeeModel.findByIdAndUpdate(credit.employeeId, {
      $inc: { creditsEnCours: -capitalRembourse }
    });
    
    // Notification détaillée
    let notifMessage = `🎉 Félicitations! Votre crédit ${credit.title} est entièrement remboursé.\n\n`;
    notifMessage += `💰 Montant débit: ${montantTotal.toFixed(2)} TND\n`;
    notifMessage += `   • Capital: ${capitalRembourse.toFixed(2)} TND\n`;
    notifMessage += `   • Frais: ${calculation.fraisRemboursement.toFixed(2)} TND\n\n`;
    notifMessage += `💵 Économie intérêts: ${calculation.economieInterets.toFixed(2)} TND\n`;
    notifMessage += `✅ Économie nette: ${calculation.economieNette.toFixed(2)} TND`;
    
    await this.notificationsService.sendToEmployee(
      credit.employeeId.toString(),
      '🎉 Crédit soldé par anticipation',
      notifMessage,
      NotificationType.SUCCESS,
    );
    
    return {
      success: true,
      creditId: credit._id,
      montantDebite: montantTotal,
      capital: capitalRembourse,
      frais: calculation.fraisRemboursement,
      economieInterets: calculation.economieInterets,
      economieNette: calculation.economieNette,
      transactionRef: reference,
    };
  }

  async generateAmortizationTable(creditId: string) {
    const credit = await this.creditModel.findById(creditId).exec();
    if (!credit) throw new NotFoundException('Crédit introuvable');
    
    const tauxMensuel = credit.tauxInteret / 100 / 12;
    const dateDebut = new Date(credit.dateDebut);
    
    // Récupérer l'historique des paiements
    const payments = await this.paymentModel
      .find({ creditId: credit._id })
      .sort({ datePaiement: 1 })
      .exec();
    
    const paymentsByMonth: Map<number, any> = new Map();
    payments.forEach(p => {
      const moisIndex = Math.floor(
        (new Date(p.datePaiement).getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      if (!paymentsByMonth.has(moisIndex)) {
        paymentsByMonth.set(moisIndex, p);
      }
    });
    
    // Générer tableau théorique avec statut réel
    const table: any[] = [];
    let soldeRestant = credit.montantInitial;
    let totalInteretsPayes = 0;
    let totalCapitalPaye = 0;
    
    for (let mois = 1; mois <= credit.nombreMois; mois++) {
      if (soldeRestant <= 0) break;
      
      // Calcul théorique
      const interetsMois = Math.round(soldeRestant * tauxMensuel * 100) / 100;
      const capitalMois = Math.min(
        Math.round((credit.mensualite - interetsMois) * 100) / 100,
        soldeRestant
      );
      const mensualiteMois = capitalMois + interetsMois;
      
      // Vérifier si ce mois a été payé
      const paiement = paymentsByMonth.get(mois - 1);
      const isPaid = !!paiement;
      const datePaiement = paiement?.datePaiement;
      
      // Calculer date échéance
      const dateEcheance = new Date(dateDebut);
      dateEcheance.setMonth(dateEcheance.getMonth() + mois);
      
      soldeRestant = Math.max(0, Math.round((soldeRestant - capitalMois) * 100) / 100);
      
      if (isPaid) {
        totalInteretsPayes += interetsMois;
        totalCapitalPaye += capitalMois;
      }
      
      table.push({
        mois,
        dateEcheance: dateEcheance.toISOString().split('T')[0],
        mensualite: mensualiteMois,
        capital: capitalMois,
        interets: interetsMois,
        soldeRestant,
        isPaid,
        datePaiement: datePaiement ? new Date(datePaiement).toISOString().split('T')[0] : null,
        capitalPaye: isPaid ? paiement.capital : 0,
        interetsPayes: isPaid ? paiement.interets : 0,
      });
    }
    
    // Calculer statistiques
    const totalMensualites = credit.mensualite * credit.nombreMois;
    const totalInteretsTheoriques = totalMensualites - credit.montantInitial;
    const moisPayes = table.filter(t => t.isPaid).length;
    const moisRestants = credit.nombreMois - moisPayes;
    
    return {
      creditId: credit._id,
      title: credit.title,
      montantInitial: credit.montantInitial,
      montantRestant: credit.montantRestant,
      tauxInteret: credit.tauxInteret,
      nombreMois: credit.nombreMois,
      mensualite: credit.mensualite,
      dateDebut: credit.dateDebut,
      dateFin: credit.dateFin,
      status: credit.status,
      
      // Statistiques
      totalMensualites,
      totalInteretsTheoriques,
      totalCapitalPaye,
      totalInteretsPayes,
      moisPayes,
      moisRestants,
      progressionPct: Math.round((totalCapitalPaye / credit.montantInitial) * 100),
      
      // Tableau détaillé
      tableau: table,
    };
  }

  async getPaymentHistory(creditId: string) {
    const credit = await this.creditModel.findById(creditId).exec();
    if (!credit) throw new NotFoundException('Crédit introuvable');
    
    const payments = await this.paymentModel
      .find({ creditId: credit._id })
      .sort({ datePaiement: -1 })
      .populate('transactionId')
      .exec();
    
    return {
      creditId: credit._id,
      title: credit.title,
      totalPayments: payments.length,
      payments: payments.map(p => ({
        id: p._id,
        datePaiement: p.datePaiement,
        montant: p.montant,
        capital: p.capital,
        interets: p.interets,
        montantRestantApres: p.montantRestantApres,
        mode: p.mode,
        isLate: p.isLate,
        penalite: p.penalite,
        transactionRef: (p.transactionId as any)?.reference,
      })),
    };
  }

  async processMonthlyCreditDeductions() {
    const credits = await this.creditModel.find({ status: CreditStatus.ACTIVE }).exec();
    const results: any[] = [];

    for (const credit of credits) {
      try {
        // 1. Trouver le compte de l'employé
        const account = await this.accountModel.findOne({ 
          employeeId: credit.employeeId 
        }).exec();
        
        if (!account) {
          results.push({ 
            creditId: credit._id, 
            status: 'ERREUR',
            raison: 'Compte bancaire introuvable' 
          });
          continue;
        }
        
        // 2. Calculer capital et intérêts pour ce mois
        const tauxMensuel = credit.tauxInteret / 100 / 12;
        const interetsMois = Math.round(credit.montantRestant * tauxMensuel * 100) / 100;
        const mensualiteActuelle = Math.min(credit.mensualite, credit.montantRestant + interetsMois);
        const capitalRembourse = Math.round((mensualiteActuelle - interetsMois) * 100) / 100;
        
        // 3. Vérifier solde suffisant
        if (account.solde < mensualiteActuelle) {
          // Marquer comme en retard
          credit.status = CreditStatus.LATE;
          await credit.save();
          
          // Notification d'impayé
          await this.notificationsService.sendToEmployee(
            credit.employeeId.toString(),
            '⚠️ Échéance crédit impayée',
            `Solde insuffisant pour la mensualité de ${mensualiteActuelle} TND. Solde actuel: ${account.solde.toFixed(2)} TND`,
            NotificationType.WARNING,
          );
          
          results.push({ 
            creditId: credit._id, 
            status: 'IMPAYÉ',
            raison: 'Solde insuffisant',
            mensualite: mensualiteActuelle,
            soldeActuel: account.solde
          });
          continue;
        }
        
        // 4. Débiter le compte
        await this.accountModel.findByIdAndUpdate(account._id, {
          $inc: { solde: -mensualiteActuelle }
        }).exec();
        
        // 5. Créer transaction bancaire
        const reference = StringUtil.generateReference('CRD');
        const transaction = await this.transactionModel.create({
          employeeId: credit.employeeId,
          accountId: account._id,
          montant: mensualiteActuelle,
          type: TransactionType.CREDIT_PAYMENT,
          category: TransactionCategory.CREDIT,
          description: `Mensualité crédit ${credit.title}`,
          status: TransactionStatus.COMPLETED,
          reference,
          date: new Date(),
          metadata: {
            creditId: credit._id.toString(),
            capital: capitalRembourse,
            interets: interetsMois,
            montantRestantAvant: credit.montantRestant,
          }
        });
        
        // 6. Mettre à jour le crédit
        const nouveauRestant = Math.max(0, Math.round((credit.montantRestant - capitalRembourse) * 100) / 100);
        credit.montantRestant = nouveauRestant;
        
        if (credit.montantRestant <= 0) {
          credit.montantRestant = 0;
          credit.status = CreditStatus.CLOSED;
        } else if (credit.status === CreditStatus.LATE) {
          credit.status = CreditStatus.ACTIVE; // Rétablir si était en retard
        }
        
        await credit.save();
        
        // 7. Enregistrer le paiement avec détails
        await this.paymentModel.create({
          creditId: credit._id,
          employeeId: credit.employeeId,
          montant: mensualiteActuelle,
          capital: capitalRembourse,
          interets: interetsMois,
          montantRestantApres: nouveauRestant,
          datePaiement: new Date(),
          mode: 'AUTO',
          transactionId: transaction._id,
          isLate: false,
          penalite: 0,
        });
        
        // 8. Notification détaillée
        const isFinalPayment = credit.status === CreditStatus.CLOSED;
        await this.notificationsService.sendToEmployee(
          credit.employeeId.toString(),
          isFinalPayment ? '✅ Crédit soldé' : '🏦 Prélèvement crédit',
          isFinalPayment 
            ? `Félicitations! Votre crédit ${credit.title} est entièrement remboursé.`
            : `Mensualité: ${mensualiteActuelle.toFixed(2)} TND (Capital: ${capitalRembourse.toFixed(2)} TND + Intérêts: ${interetsMois.toFixed(2)} TND). Reste: ${nouveauRestant.toFixed(2)} TND`,
          isFinalPayment ? NotificationType.SUCCESS : NotificationType.TRANSACTION,
        );
        
        results.push({ 
          creditId: credit._id,
          status: isFinalPayment ? 'SOLDÉ' : 'PAYÉ',
          mensualite: mensualiteActuelle,
          capital: capitalRembourse,
          interets: interetsMois,
          reste: nouveauRestant,
          transactionRef: reference,
        });
        
      } catch (e) {
        results.push({ 
          creditId: credit._id, 
          status: 'ERREUR',
          error: e.message 
        });
      }
    }
    
    return results;
  }

  async processMonthlyInstallment(creditId: string) {
    const credit = await this.creditModel.findById(creditId).exec();
    if (!credit) throw new NotFoundException('Credit not found');
    if (credit.status !== CreditStatus.ACTIVE) return { success: false, message: 'Credit is not active' };

    // Trouver le compte
    const account = await this.accountModel.findOne({ employeeId: credit.employeeId }).exec();
    if (!account) throw new NotFoundException('Compte bancaire introuvable');
    
    // Calculer capital et intérêts
    const tauxMensuel = credit.tauxInteret / 100 / 12;
    const interetsMois = Math.round(credit.montantRestant * tauxMensuel * 100) / 100;
    const mensualiteActuelle = Math.min(credit.mensualite, credit.montantRestant + interetsMois);
    const capitalRembourse = Math.round((mensualiteActuelle - interetsMois) * 100) / 100;
    
    // Vérifier solde
    if (account.solde < mensualiteActuelle) {
      throw new BadRequestException(`Solde insuffisant. Requis: ${mensualiteActuelle} TND, Disponible: ${account.solde} TND`);
    }
    
    // Débiter compte
    await this.accountModel.findByIdAndUpdate(account._id, {
      $inc: { solde: -mensualiteActuelle }
    }).exec();
    
    // Créer transaction
    const reference = StringUtil.generateReference('CRD');
    const transaction = await this.transactionModel.create({
      employeeId: credit.employeeId,
      accountId: account._id,
      montant: mensualiteActuelle,
      type: TransactionType.CREDIT_PAYMENT,
      category: TransactionCategory.CREDIT,
      description: `Mensualité crédit ${credit.title}`,
      status: TransactionStatus.COMPLETED,
      reference,
      date: new Date(),
      metadata: {
        creditId: credit._id.toString(),
        capital: capitalRembourse,
        interets: interetsMois,
      }
    });
    
    // Mise à jour crédit
    const nouveauRestant = Math.max(0, Math.round((credit.montantRestant - capitalRembourse) * 100) / 100);
    credit.montantRestant = nouveauRestant;

    if (credit.montantRestant <= 0) {
      credit.montantRestant = 0;
      credit.status = CreditStatus.CLOSED;
    }
    await credit.save();

    await this.paymentModel.create({
      creditId: credit._id,
      employeeId: credit.employeeId,
      montant: mensualiteActuelle,
      capital: capitalRembourse,
      interets: interetsMois,
      montantRestantApres: nouveauRestant,
      datePaiement: new Date(),
      mode: 'MANUAL',
      transactionId: transaction._id,
      isLate: false,
      penalite: 0,
    });

    await this.notificationsService.sendToEmployee(
      credit.employeeId.toString(),
      '🏦 Prélèvement crédit',
      `Mensualité: ${mensualiteActuelle} TND (Capital: ${capitalRembourse} TND + Intérêts: ${interetsMois} TND). Reste: ${nouveauRestant} TND`,
      NotificationType.TRANSACTION,
    );

    return { 
      success: true, 
      creditId: credit._id, 
      mensualite: mensualiteActuelle,
      capital: capitalRembourse,
      interets: interetsMois,
      reste: nouveauRestant,
      transactionRef: reference,
    };
  }
}
