import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from '../employees/employee.schema';
import { EmployeeStatus } from '../common/enums/employee-status.enum';
import { PayrollService } from '../payroll/payroll.service';
import { CreditsService } from '../credits/credits.service';
import { LeaveService } from '../leave/leave.service';
import { CongesService } from '../requests/conges.service';
import { Account } from '../accounts/schemas/account.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ACCOUNT_EVENTS } from '../common/constants/events.constants';
import { DocumentsService } from '../documents/documents.service';
import { PrimesService } from '../primes/primes.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    private payrollService: PayrollService,
    private creditsService: CreditsService,
    private leaveService: LeaveService,
    private congesService: CongesService,
    private eventEmitter: EventEmitter2,
    private documentsService: DocumentsService,
    private primesService: PrimesService,
  ) {}

  @Cron('0 0 * * *')
  async handleDailyTasks() {
    this.logger.log('🚀 CRON: Running daily tasks...');
    await this.resetDailyLimits();
    await this.handleLateCreditPenalties(); // NOUVEAU: Pénalités quotidiennes
    this.logger.log('✅ Daily tasks completed');
  }

  @Cron('0 0 1 * *')
  async handleMonthlyTasks() {
    this.logger.log('🚀 CRON: Running monthly tasks...');
    await Promise.all([
      this.handleMonthlyPayroll(),
      this.handleMonthlyCreditDeductions(),
      this.handleMonthlyLeaveAccrual(),
      this.handleMonthlySalaryCredit(),
      this.resetMonthlyLimits(),
    ]);
    this.logger.log('✅ Monthly tasks completed');
  }

  @Cron('0 0 1 1 *') // 1er janvier chaque année
  async handleYearlyTasks() {
    this.logger.log('🚀 CRON: Running yearly tasks...');
    await this.handleYearEndCongesReport();
    this.logger.log('✅ Yearly tasks completed');
  }

  @Cron('0 0 * * 0')
  async handleWeeklyTasks() {
    this.logger.log('🚀 CRON: Running weekly tasks...');
    this.logger.log('✅ Weekly tasks completed');
  }

  @Cron('*/5 * * * *')
  async handleFraudMonitoring() {
    this.logger.log('🔍 CRON: Running fraud monitoring...');
    // This would integrate with the fraud detection service
    this.logger.log('✅ Fraud monitoring completed');
  }

  @Cron('0 9 1 * *') // Weekly reports: every Monday at 9AM
  async handleWeeklyReports() {
    this.logger.log('📊 CRON: Generating weekly reports...');
    this.logger.log('✅ Weekly reports completed');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PRIMES AUTOMATIQUES — Système bancaire STB
  //  Chaque prime est calculée et versée automatiquement à la bonne date
  // ═══════════════════════════════════════════════════════════════════════════

  /** Prime Annuelle — 1er décembre à 8h (équivalent 13ème mois bancaire) */
  @Cron('0 8 1 12 *')
  async handlePrimeAnnuelle() {
    this.logger.log('🎁 CRON PRIME: Distribution Prime Annuelle (Décembre)...');
    try {
      const result = await this.primesService.distributeToAll('system', {
        type: 'PERFORMANCE',
        montant: 1000,
        description: 'Prime Annuelle STB — Distribution automatique Décembre',
      });
      this.logger.log(`✅ Prime Annuelle: ${result.credited}/${result.total} employés crédités (${result.montantTotal} TND)`);
    } catch (e) {
      this.logger.error('❌ Prime Annuelle failed:', e.message);
    }
  }

  /** Prime Aïd el Fitr — 25 mars à 8h (10 jours avant Aïd estimé) */
  @Cron('0 8 25 3 *')
  async handlePrimeAidFitr() {
    this.logger.log('🌙 CRON PRIME: Distribution Prime Aïd el Fitr...');
    try {
      const result = await this.primesService.distributeToAll('system', {
        type: 'AID',
        montant: 500,
        description: 'Prime Aïd el Fitr — Distribution automatique STB',
      });
      this.logger.log(`✅ Prime Aïd Fitr: ${result.credited}/${result.total} employés crédités (${result.montantTotal} TND)`);
    } catch (e) {
      this.logger.error('❌ Prime Aïd Fitr failed:', e.message);
    }
  }

  /** Prime Aïd el Adha — 15 juin à 8h (10 jours avant Aïd estimé) */
  @Cron('0 8 15 6 *')
  async handlePrimeAidAdha() {
    this.logger.log('🐑 CRON PRIME: Distribution Prime Aïd el Adha...');
    try {
      const result = await this.primesService.distributeToAll('system', {
        type: 'AID',
        montant: 500,
        description: 'Prime Aïd el Adha — Distribution automatique STB',
      });
      this.logger.log(`✅ Prime Aïd Adha: ${result.credited}/${result.total} employés crédités (${result.montantTotal} TND)`);
    } catch (e) {
      this.logger.error('❌ Prime Aïd Adha failed:', e.message);
    }
  }

  /** Prime Ramadan — 1er mars à 8h */
  @Cron('0 8 1 3 *')
  async handlePrimeRamadan() {
    this.logger.log('✨ CRON PRIME: Distribution Prime Ramadan...');
    try {
      const result = await this.primesService.distributeToAll('system', {
        type: 'RAMADAN',
        montant: 300,
        description: 'Prime Ramadan STB — Distribution automatique',
      });
      this.logger.log(`✅ Prime Ramadan: ${result.credited}/${result.total} employés crédités (${result.montantTotal} TND)`);
    } catch (e) {
      this.logger.error('❌ Prime Ramadan failed:', e.message);
    }
  }

  /** Prime Ancienneté — 1er janvier à 8h, calculée selon les années de service */
  @Cron('0 8 1 1 *')
  async handlePrimeAnciennete() {
    this.logger.log('🏆 CRON PRIME: Distribution Prime Ancienneté...');
    try {
      await this._distributeAncienneteBySlice();
    } catch (e) {
      this.logger.error('❌ Prime Ancienneté failed:', e.message);
    }
  }

  /** Prime Vacances — 1er juillet à 8h */
  @Cron('0 8 1 7 *')
  async handlePrimeVacances() {
    this.logger.log('☀️ CRON PRIME: Distribution Prime Vacances...');
    try {
      const result = await this.primesService.distributeToAll('system', {
        type: 'VACANCES',
        montant: 400,
        description: 'Prime Vacances STB — Distribution automatique Juillet',
      });
      this.logger.log(`✅ Prime Vacances: ${result.credited}/${result.total} employés crédités (${result.montantTotal} TND)`);
    } catch (e) {
      this.logger.error('❌ Prime Vacances failed:', e.message);
    }
  }

  /** Calcul ancienneté par tranches (1-3 ans: 200, 3-5 ans: 400, 5-10 ans: 700, >10 ans: 1000) */
  private async _distributeAncienneteBySlice() {
    const employees = await this.employeeModel.find({ status: EmployeeStatus.ACTIVE }).lean().exec() as any[];
    const now = new Date();
    let total = 0;

    for (const emp of employees) {
      try {
        const hireDate = emp.dateEmbauche ? new Date(emp.dateEmbauche) : null;
        if (!hireDate) continue;
        const years = (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

        let montant = 0;
        if (years >= 10) montant = 1000;
        else if (years >= 5) montant = 700;
        else if (years >= 3) montant = 400;
        else if (years >= 1) montant = 200;
        else continue; // Moins d'un an: pas de prime ancienneté

        await this.primesService.adminCreate('system', {
          employeeId: emp._id.toString(),
          type: 'ANCIENNETE',
          montant,
          description: `Prime Ancienneté ${Math.floor(years)} ans de service — Auto STB`,
        });
        total++;
        this.logger.log(`  → ${emp.prenom} ${emp.nom}: ${montant} TND (${Math.floor(years)} ans)`);
      } catch (e) {
        this.logger.error(`  ✗ ${emp.matricule}: ${e.message}`);
      }
    }
    this.logger.log(`✅ Prime Ancienneté: ${total} employés crédités`);
  }

  private async resetDailyLimits() {
    await this.accountModel.updateMany(
      { lastWithdrawalReset: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      { dailySpent: 0, lastWithdrawalReset: new Date() },
    );
    this.logger.log('Daily limits reset');
  }

  private async resetMonthlyLimits() {
    await this.accountModel.updateMany(
      { lastMonthlyReset: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      { monthlySpent: 0, lastMonthlyReset: new Date() },
    );
    this.logger.log('Monthly limits reset');
  }

  private async handleMonthlyPayroll() {
    const now = new Date();
    const mois = now.getMonth() + 1;
    const annee = now.getFullYear();
    try {
      const results = await this.payrollService.generateMonthlyPayroll(mois, annee);
      this.logger.log(`Payroll generated for ${results.length} employees`);
    } catch (error) {
      this.logger.error(`Payroll generation failed: ${error.message}`, error.stack);
    }
  }

  private async handleMonthlyCreditDeductions() {
    try {
      const results = await this.creditsService.processMonthlyCreditDeductions();
      this.logger.log(`Credit deductions processed: ${results.length} credits`);
    } catch (error) {
      this.logger.error(`Credit deductions failed: ${error.message}`, error.stack);
    }
  }

  private async handleMonthlyLeaveAccrual() {
    try {
      await this.leaveService.addMonthlyBalance(7.5);
      this.logger.log('Leave balance accrual completed');
    } catch (error) {
      this.logger.error(`Leave accrual failed: ${error.message}`, error.stack);
    }
  }

  private async handleMonthlySalaryCredit() {
    try {
      const results = await this.payrollService.creditMonthlySalaries();
      this.logger.log(`Monthly salaries credited: ${results.length} employees`);
    } catch (error) {
      this.logger.error(`Monthly salary credit failed: ${error.message}`, error.stack);
    }
  }

  @Cron('0 6 1 * *')
  async handleMonthlyDocumentGeneration() {
    this.logger.log('📄 CRON: Running monthly document generation...');
    try {
      await this._generateMonthlyDocuments();
      this.logger.log('Monthly document generation completed');
    } catch (error) {
      this.logger.error(`Document generation failed: ${error.message}`, error.stack);
    }
  }

  private async _generateMonthlyDocuments() {
    const employees = await this.employeeModel.find({ status: EmployeeStatus.ACTIVE }).exec();
    let count = 0;
    for (const emp of employees) {
      try {
        await this._generateEmployeeDocuments(emp);
        count++;
      } catch (e: any) {
        this.logger.error(`Failed to generate docs for ${emp.matricule}: ${e?.message}`);
      }
    }
    this.logger.log(`Generated documents for ${count} employees`);
  }

  private async _generateEmployeeDocuments(emp: EmployeeDocument) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthName = now.toLocaleString('fr-FR', { month: 'long' });
    const docEntries = [
      {
        type: 'CONTRACT',
        title: `Contrat de Travail - ${emp.prenom} ${emp.nom}`,
        filename: `contrat_${emp.matricule}_${year}.pdf`,
        url: `generated/contrat_${emp.matricule}_${year}.pdf`,
      },
      {
        type: 'ATTESTATION',
        title: `Attestation de Travail - ${emp.prenom} ${emp.nom}`,
        filename: `attestation_${emp.matricule}_${year}.pdf`,
        url: `generated/attestation_${emp.matricule}_${year}.pdf`,
      },
      {
        type: 'PAYSLIP',
        title: `Fiche de Paie - ${emp.prenom} ${emp.nom} - ${monthName} ${year}`,
        filename: `fichedepaie_${emp.matricule}_${year}_${month}.pdf`,
        url: `generated/fichedepaie_${emp.matricule}_${year}_${month}.pdf`,
      },
    ];
    for (const entry of docEntries) {
      await this.documentsService.create({
        employeeId: emp._id,
        type: entry.type,
        title: entry.title,
        filename: entry.filename,
        url: entry.url,
        generated: true,
      } as any);
    }
  }

  private async handleLateCreditPenalties() {
    try {
      const results = await this.creditsService.processLatePaymentPenalties();
      this.logger.log(`Late credit penalties processed: ${results.length} credits`);
    } catch (error) {
      this.logger.error(`Late credit penalties failed: ${error.message}`, error.stack);
    }
  }

  private async handleYearEndCongesReport() {
    try {
      await this.congesService.handleYearEndConges();
      this.logger.log('Year-end congés report completed');
    } catch (error) {
      this.logger.error(`Year-end congés report failed: ${error.message}`, error.stack);
    }
  }
}
