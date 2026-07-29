import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payroll, PayrollDocument, PayrollStatus } from './schemas/payroll.schema';
import { Budget, BudgetDocument, BudgetStatus } from './schemas/budget.schema';
import { Investment, InvestmentDocument, InvestmentStatus } from './schemas/investment.schema';
import { CreatePayrollDto } from './dto/payroll.dto';
import { CreateBudgetDto, UpdateBudgetProgressDto, UpdateBudgetStatusDto } from './dto/budget.dto';
import { CreateInvestmentDto, UpdateInvestmentStatusDto } from './dto/investment.dto';
import { EmployeeDocument } from '../employees/employee.schema';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Payroll.name) private readonly payrollModel: Model<PayrollDocument>,
    @InjectModel(Budget.name) private readonly budgetModel: Model<BudgetDocument>,
    @InjectModel(Investment.name) private readonly investmentModel: Model<InvestmentDocument>,
    @InjectModel('Employee') private readonly employeeModel: Model<EmployeeDocument>,
  ) {}

  // ── Payroll ──────────────────────────────────────────────────

  async createPayroll(dto: CreatePayrollDto) {
    const existing = await this.payrollModel.findOne({
      employeeId: new Types.ObjectId(dto.employeeId),
      month: dto.month,
      year: dto.year,
    });
    if (existing) {
      throw new BadRequestException('Fiche de paie déjà existante pour ce mois');
    }

    const salaireNet =
      dto.salaireBase -
      (dto.impot || 0) -
      (dto.securiteSociale || 0) -
      (dto.avancesDeduites || 0) -
      (dto.creditsDeduits || 0) +
      (dto.prime || 0);

    const payroll = new this.payrollModel({
      employeeId: new Types.ObjectId(dto.employeeId),
      month: dto.month,
      year: dto.year,
      salaireBase: dto.salaireBase,
      prime: dto.prime || 0,
      avancesDeduites: dto.avancesDeduites || 0,
      creditsDeduits: dto.creditsDeduits || 0,
      impot: dto.impot || 0,
      securiteSociale: dto.securiteSociale || 0,
      salaireNet,
      status: PayrollStatus.DRAFT,
    });

    return payroll.save();
  }

  async getPayrolls(employeeId?: string, month?: number, year?: number) {
    const filter: any = {};
    if (employeeId) {
      filter.employeeId = new Types.ObjectId(employeeId);
    }
    if (month) {
      filter.month = month;
    }
    if (year) {
      filter.year = year;
    }
    return this.payrollModel
      .find(filter)
      .populate('employeeId', 'nom prenom matricule')
      .sort({ year: -1, month: -1 })
      .exec();
  }

  async getPayrollById(id: string) {
    return this.payrollModel
      .findById(id)
      .populate('employeeId', 'nom prenom matricule poste')
      .exec();
  }

  async updatePayrollStatus(
    id: string,
    status: PayrollStatus,
    commentaire?: string,
    validatedBy?: string,
  ) {
    const payroll = await this.payrollModel.findById(id);
    if (!payroll) {
      throw new NotFoundException('Fiche de paie non trouvée');
    }

    payroll.status = status;
    payroll.commentaire = commentaire || '';
    if (validatedBy) {
      payroll.validatedBy = new Types.ObjectId(validatedBy);
      payroll.validatedAt = new Date();
    }

    return payroll.save();
  }

  // ── Budgets ──────────────────────────────────────────────────

  async createBudget(dto: CreateBudgetDto, createdBy: string) {
    const budget = new this.budgetModel({
      name: dto.name,
      department: dto.department,
      amount: dto.amount,
      commentaire: dto.commentaire || '',
      createdBy: new Types.ObjectId(createdBy),
      status: BudgetStatus.DRAFT,
    });

    return budget.save();
  }

  async getBudgets(department?: string, status?: string) {
    const filter: any = {};
    if (department) {
      filter.department = department;
    }
    if (status) {
      filter.status = status;
    }
    return this.budgetModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateBudgetProgress(id: string, dto: UpdateBudgetProgressDto) {
    const budget = await this.budgetModel.findById(id);
    if (!budget) {
      throw new NotFoundException('Budget non trouvé');
    }

    if (dto.isSavings) {
      budget.savings += dto.amount;
    } else {
      budget.spent += dto.amount;
    }

    return budget.save();
  }

  async updateBudgetStatus(
    id: string,
    status: BudgetStatus,
    commentaire?: string,
    approvedBy?: string,
  ) {
    const budget = await this.budgetModel.findById(id);
    if (!budget) {
      throw new NotFoundException('Budget non trouvé');
    }

    budget.status = status;
    budget.commentaire = commentaire || '';
    if (approvedBy) {
      budget.approvedBy = new Types.ObjectId(approvedBy);
      budget.approvedAt = new Date();
    }

    return budget.save();
  }

  // ── Investments ──────────────────────────────────────────────

  async createInvestment(dto: CreateInvestmentDto) {
    const investment = new this.investmentModel({
      employeeId: new Types.ObjectId(dto.employeeId),
      name: dto.name,
      amount: dto.amount,
      expectedReturn: dto.expectedReturn,
      commentaire: dto.commentaire || '',
      status: InvestmentStatus.PENDING,
    });

    return investment.save();
  }

  async getInvestments(employeeId?: string, status?: string) {
    const filter: any = {};
    if (employeeId) {
      filter.employeeId = new Types.ObjectId(employeeId);
    }
    if (status) {
      filter.status = status;
    }
    return this.investmentModel
      .find(filter)
      .populate('employeeId', 'nom prenom matricule')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateInvestmentStatus(
    id: string,
    status: InvestmentStatus,
    commentaire?: string,
    approvedBy?: string,
  ) {
    const investment = await this.investmentModel.findById(id);
    if (!investment) {
      throw new NotFoundException('Investissement non trouvé');
    }

    investment.status = status;
    investment.commentaire = commentaire || '';
    if (approvedBy) {
      investment.approvedBy = new Types.ObjectId(approvedBy);
      investment.approvedAt = new Date();
    }

    return investment.save();
  }

  // ── Dashboard Stats ──────────────────────────────────────────

  async getDashboardStats() {
    const [totalPayrolls, activeBudgets, activeInvestments, pendingPayrolls] =
      await Promise.all([
        this.payrollModel.countDocuments(),
        this.budgetModel.countDocuments({ status: BudgetStatus.ACTIVE }),
        this.investmentModel.countDocuments({ status: InvestmentStatus.ACTIVE }),
        this.payrollModel.countDocuments({ status: PayrollStatus.DRAFT }),
      ]);

    const totalPayrollAmount = await this.payrollModel.aggregate([
      { $group: { _id: null, total: { $sum: '$salaireNet' } } },
    ]);

    const totalBudgetAmount = await this.budgetModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      totalPayrolls,
      totalPayrollAmount: totalPayrollAmount[0]?.total || 0,
      pendingPayrolls,
      activeBudgets,
      totalBudgetAmount: totalBudgetAmount[0]?.total || 0,
      activeInvestments,
    };
  }
}