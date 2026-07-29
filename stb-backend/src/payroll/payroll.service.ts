import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payroll, PayrollStatus } from './schemas/payroll.schema';
import { Employee } from '../employees/employee.schema';
import { Account } from '../accounts/schemas/account.schema';
import { Transaction, TransactionType, TransactionStatus, TransactionCategory } from '../transactions/schemas/transaction.schema';
import { EmployeeStatus } from '../common/enums/employee-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { CreditsService } from '../credits/credits.service';
import { StringUtil } from '../common/utils/string.util';

@Injectable()
export class PayrollService {
  constructor(
    @InjectModel(Payroll.name) private payrollModel: Model<Payroll>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private notificationsService: NotificationsService,
    private creditsService: CreditsService,
  ) {}

  async generateMonthlyPayroll(mois: number, annee: number) {
    const employees = await this.employeeModel.find({ status: EmployeeStatus.ACTIVE }).exec();
    const results: any[] = [];

    for (const emp of employees) {
      try {
        const existing = await this.payrollModel.findOne({ employeeId: emp._id, mois, annee }).exec();
        if (existing) { results.push({ matricule: emp.matricule, status: 'ALREADY_EXISTS' }); continue; }

        const salaireBrut = emp.salaireBase || 1200;
        const cnss = Math.round(salaireBrut * 0.0918 * 100) / 100;
        const impot = Math.round(salaireBrut * 0.15 * 100) / 100;

        let retenues = 0;
        const credits = await this.creditsService.getMyCredits(emp._id.toString());
        for (const credit of credits) {
          if (credit.status === 'ACTIVE') {
            retenues += Math.min(credit.mensualite, credit.montantRestant);
          }
        }
        
        // Add avance to retenues
        const avanceADeduire = emp.avancesEnCours || 0;
        retenues += avanceADeduire;
        
        retenues = Math.min(retenues, salaireBrut * 0.7); // Allow up to 70% deduction if there's an advance
        retenues = Math.round(retenues * 100) / 100;
        
        const totalRestant = credits.reduce((acc, c) => acc + (c.status === 'ACTIVE' ? c.montantRestant : 0), 0);
        emp.creditsEnCours = Math.max(0, totalRestant - (retenues - avanceADeduire));
        emp.avancesEnCours = 0; // Reset advance after deduction
        await emp.save();

        const salaireNet = Math.round((salaireBrut - cnss - impot - retenues) * 100) / 100;

        const payroll = await this.payrollModel.create({
          employeeId: emp._id,
          mois,
          annee,
          salaireBrut,
          cnss,
          impot,
          retenues,
          salaireNet,
          status: PayrollStatus.VALIDATED,
        });

        await this.notificationsService.sendToEmployee(
          emp._id.toString(),
          '💰 Fiche de paie disponible',
          `Votre fiche de paie de ${this.getMonthName(mois)} ${annee} est prête. Salaire net: ${salaireNet} TND.`,
          NotificationType.SYSTEM,
        );

        results.push({ matricule: emp.matricule, status: 'CREATED', salaireNet });
      } catch (e) {
        results.push({ matricule: emp.matricule, status: 'ERROR', error: e.message });
      }
    }
    return results;
  }

  async getMyPayrolls(employeeId: string) {
    return this.payrollModel.find({ employeeId: new Types.ObjectId(employeeId) }).sort({ annee: -1, mois: -1 }).exec();
  }

  async getPayrollById(id: string) {
    const p = await this.payrollModel.findById(id).populate('employeeId').exec();
    if (!p) throw new NotFoundException('Fiche de paie introuvable');
    return p;
  }

  async getAllPayrolls(mois?: number, annee?: number) {
    const filter: any = {};
    if (mois) filter.mois = mois;
    if (annee) filter.annee = annee;
    return this.payrollModel.find(filter).populate('employeeId', 'nom prenom matricule departement').sort({ annee: -1, mois: -1 }).exec();
  }

  async creditMonthlySalaries() {
    const employees = await this.employeeModel.find({ status: EmployeeStatus.ACTIVE }).exec();
    const results: any[] = [];
    
    for (const emp of employees) {
      try {
        const salaireBrut = emp.salaireBase || 1200;
        
        // 1. Trouver le compte de l'employé
        const account = await this.accountModel.findOne({ employeeId: emp._id }).exec();
        if (!account) {
          results.push({ 
            matricule: emp.matricule, 
            error: 'Compte bancaire introuvable' 
          });
          continue;
        }
        
        // 2. Calculer déductions (CNSS, Impôt)
        const cnss = Math.round(salaireBrut * 0.0918 * 100) / 100;
        const impot = Math.round(salaireBrut * 0.15 * 100) / 100;
        const deductionsSociales = cnss + impot;
        
        // 3. Récupérer les crédits actifs
        const credits = await this.creditsService.getMyCredits(emp._id.toString());
        const activeCredits = credits.filter(c => c.status === 'ACTIVE');
        
        // 4. Calculer total mensualités crédits
        let totalMensualitesCredits = 0;
        const creditDetails: any[] = [];
        
        for (const credit of activeCredits) {
          const tauxMensuel = credit.tauxInteret / 100 / 12;
          const interetsMois = Math.round(credit.montantRestant * tauxMensuel * 100) / 100;
          const mensualiteActuelle = Math.min(credit.mensualite, credit.montantRestant + interetsMois);
          const capitalRembourse = Math.round((mensualiteActuelle - interetsMois) * 100) / 100;
          
          totalMensualitesCredits += mensualiteActuelle;
          creditDetails.push({
            creditId: credit._id,
            title: credit.title,
            mensualite: mensualiteActuelle,
            capital: capitalRembourse,
            interets: interetsMois,
          });
        }
        
        // 🆕 5. Ajouter les avances en cours aux déductions
        const avancesADeduire = emp.avancesEnCours || 0;
        const totalDeductionsFinancieres = Math.round((totalMensualitesCredits + avancesADeduire) * 100) / 100;
        
        // 6. Calculer salaire net APRÈS crédits ET avances
        const salaireAvantCredits = salaireBrut - deductionsSociales;
        const salaireNet = Math.max(0, Math.round((salaireAvantCredits - totalDeductionsFinancieres) * 100) / 100);
        
        // 6. Créditer le salaire NET (après déduction crédits) sur le compte
        await this.accountModel.findByIdAndUpdate(account._id, {
          $inc: { solde: salaireNet }
        }).exec();
        
        // 7. Créer transaction salaire
        const refSalaire = StringUtil.generateReference('SAL');
        await this.transactionModel.create({
          employeeId: emp._id,
          accountId: account._id,
          montant: salaireNet,
          type: TransactionType.SALARY,
          category: TransactionCategory.SALARY,
          description: `Salaire ${this.getMonthName(new Date().getMonth() + 1)} ${new Date().getFullYear()}`,
          status: TransactionStatus.COMPLETED,
          reference: refSalaire,
          date: new Date(),
          metadata: {
            salaireBrut,
            cnss,
            impot,
            deductionsSociales,
            totalCredits: totalMensualitesCredits,
            avancesDeduites: avancesADeduire,
            salaireNet,
          }
        });
        
        // 8. Créer transaction déduction avances SI avances > 0
        if (avancesADeduire > 0) {
          const refAvance = StringUtil.generateReference('AVN');
          await this.transactionModel.create({
            employeeId: emp._id,
            accountId: account._id,
            montant: -avancesADeduire, // Negative = deduction
            type: TransactionType.AVANCE,
            category: TransactionCategory.OTHER,
            description: `Déduction avances sur salaire`,
            status: TransactionStatus.COMPLETED,
            reference: refAvance,
            date: new Date(),
            metadata: {
              montantDeduit: avancesADeduire,
              deductionSource: 'PAYROLL',
            }
          });
        }
        
        // 9. Traiter chaque crédit individuellement
        const creditPayments: any[] = [];
        for (const detail of creditDetails) {
          try {
            // Trouver le crédit complet
            const credit = activeCredits.find(c => c._id.toString() === detail.creditId.toString());
            if (!credit) continue;
            
            // Créer transaction crédit
            const refCredit = StringUtil.generateReference('CRD');
            const transaction = await this.transactionModel.create({
              employeeId: emp._id,
              accountId: account._id,
              montant: detail.mensualite,
              type: TransactionType.CREDIT_PAYMENT,
              category: TransactionCategory.CREDIT,
              description: `Prélèvement crédit ${detail.title}`,
              status: TransactionStatus.COMPLETED,
              reference: refCredit,
              date: new Date(),
              metadata: {
                creditId: detail.creditId.toString(),
                capital: detail.capital,
                interets: detail.interets,
                deductionSource: 'PAYROLL',
              }
            });
            
            // Mettre à jour le crédit
            const nouveauRestant = Math.max(0, Math.round((credit.montantRestant - detail.capital) * 100) / 100);
            credit.montantRestant = nouveauRestant;
            
            if (credit.montantRestant <= 0) {
              credit.montantRestant = 0;
              credit.status = 'CLOSED' as any;
            }
            
            await credit.save();
            
            // Créer enregistrement paiement crédit
            await this.creditsService['paymentModel'].create({
              creditId: credit._id,
              employeeId: emp._id,
              montant: detail.mensualite,
              capital: detail.capital,
              interets: detail.interets,
              montantRestantApres: nouveauRestant,
              datePaiement: new Date(),
              mode: 'PAYROLL',
              transactionId: transaction._id,
              isLate: false,
              penalite: 0,
            });
            
            creditPayments.push({
              creditTitle: detail.title,
              mensualite: detail.mensualite,
              capital: detail.capital,
              interets: detail.interets,
              reste: nouveauRestant,
              transactionRef: refCredit,
            });
            
          } catch (creditError) {
            console.error(`Erreur traitement crédit ${detail.creditId}:`, creditError);
          }
        }
        
        // 10. Mettre à jour Employee.compteSolde (sync avec Account)
        await this.employeeModel.updateOne(
          { _id: emp._id }, 
          { 
            $inc: { compteSolde: salaireNet },
            $set: { avancesEnCours: 0 } // Reset avances after deduction
          }
        );
        
        // 11. Notification détaillée
        let notifMessage = `Salaire brut: ${salaireBrut} TND\n`;
        notifMessage += `Déductions sociales: -${deductionsSociales.toFixed(2)} TND\n`;
        
        if (avancesADeduire > 0) {
          notifMessage += `\n💰 Avances déduites: -${avancesADeduire.toFixed(2)} TND\n`;
        }
        
        if (creditPayments.length > 0) {
          notifMessage += `\n💳 Crédits déduits:\n`;
          creditPayments.forEach(cp => {
            notifMessage += `- ${cp.creditTitle}: ${cp.mensualite.toFixed(2)} TND (Capital: ${cp.capital.toFixed(2)} + Intérêts: ${cp.interets.toFixed(2)})\n`;
          });
        }
        
        notifMessage += `\n✅ Versement net: ${salaireNet.toFixed(2)} TND`;
        
        await this.notificationsService.sendToEmployee(
          emp._id.toString(),
          '💰 Salaire versé',
          notifMessage,
          NotificationType.SYSTEM
        );
        
        results.push({ 
          matricule: emp.matricule,
          salaireBrut,
          deductionsSociales,
          avancesDeduites: avancesADeduire,
          creditsDebites: totalMensualitesCredits,
          salaireNet,
          creditPayments,
          newBalance: account.solde + salaireNet,
        });
        
      } catch (e) {
        results.push({ 
          matricule: emp.matricule, 
          error: e.message 
        });
      }
    }
    
    return results;
  }

  private getMonthName(mois: number): string {
    const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return months[mois - 1] || String(mois);
  }
}
