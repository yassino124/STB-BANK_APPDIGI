"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payroll_schema_1 = require("./schemas/payroll.schema");
const budget_schema_1 = require("./schemas/budget.schema");
const investment_schema_1 = require("./schemas/investment.schema");
let FinanceService = class FinanceService {
    payrollModel;
    budgetModel;
    investmentModel;
    employeeModel;
    constructor(payrollModel, budgetModel, investmentModel, employeeModel) {
        this.payrollModel = payrollModel;
        this.budgetModel = budgetModel;
        this.investmentModel = investmentModel;
        this.employeeModel = employeeModel;
    }
    async createPayroll(dto) {
        const existing = await this.payrollModel.findOne({
            employeeId: new mongoose_2.Types.ObjectId(dto.employeeId),
            month: dto.month,
            year: dto.year,
        });
        if (existing) {
            throw new common_1.BadRequestException('Fiche de paie déjà existante pour ce mois');
        }
        const salaireNet = dto.salaireBase -
            (dto.impot || 0) -
            (dto.securiteSociale || 0) -
            (dto.avancesDeduites || 0) -
            (dto.creditsDeduits || 0) +
            (dto.prime || 0);
        const payroll = new this.payrollModel({
            employeeId: new mongoose_2.Types.ObjectId(dto.employeeId),
            month: dto.month,
            year: dto.year,
            salaireBase: dto.salaireBase,
            prime: dto.prime || 0,
            avancesDeduites: dto.avancesDeduites || 0,
            creditsDeduits: dto.creditsDeduits || 0,
            impot: dto.impot || 0,
            securiteSociale: dto.securiteSociale || 0,
            salaireNet,
            status: payroll_schema_1.PayrollStatus.DRAFT,
        });
        return payroll.save();
    }
    async getPayrolls(employeeId, month, year) {
        const filter = {};
        if (employeeId) {
            filter.employeeId = new mongoose_2.Types.ObjectId(employeeId);
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
    async getPayrollById(id) {
        return this.payrollModel
            .findById(id)
            .populate('employeeId', 'nom prenom matricule poste')
            .exec();
    }
    async updatePayrollStatus(id, status, commentaire, validatedBy) {
        const payroll = await this.payrollModel.findById(id);
        if (!payroll) {
            throw new common_1.NotFoundException('Fiche de paie non trouvée');
        }
        payroll.status = status;
        payroll.commentaire = commentaire || '';
        if (validatedBy) {
            payroll.validatedBy = new mongoose_2.Types.ObjectId(validatedBy);
            payroll.validatedAt = new Date();
        }
        return payroll.save();
    }
    async createBudget(dto, createdBy) {
        const budget = new this.budgetModel({
            name: dto.name,
            department: dto.department,
            amount: dto.amount,
            commentaire: dto.commentaire || '',
            createdBy: new mongoose_2.Types.ObjectId(createdBy),
            status: budget_schema_1.BudgetStatus.DRAFT,
        });
        return budget.save();
    }
    async getBudgets(department, status) {
        const filter = {};
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
    async updateBudgetProgress(id, dto) {
        const budget = await this.budgetModel.findById(id);
        if (!budget) {
            throw new common_1.NotFoundException('Budget non trouvé');
        }
        if (dto.isSavings) {
            budget.savings += dto.amount;
        }
        else {
            budget.spent += dto.amount;
        }
        return budget.save();
    }
    async updateBudgetStatus(id, status, commentaire, approvedBy) {
        const budget = await this.budgetModel.findById(id);
        if (!budget) {
            throw new common_1.NotFoundException('Budget non trouvé');
        }
        budget.status = status;
        budget.commentaire = commentaire || '';
        if (approvedBy) {
            budget.approvedBy = new mongoose_2.Types.ObjectId(approvedBy);
            budget.approvedAt = new Date();
        }
        return budget.save();
    }
    async createInvestment(dto) {
        const investment = new this.investmentModel({
            employeeId: new mongoose_2.Types.ObjectId(dto.employeeId),
            name: dto.name,
            amount: dto.amount,
            expectedReturn: dto.expectedReturn,
            commentaire: dto.commentaire || '',
            status: investment_schema_1.InvestmentStatus.PENDING,
        });
        return investment.save();
    }
    async getInvestments(employeeId, status) {
        const filter = {};
        if (employeeId) {
            filter.employeeId = new mongoose_2.Types.ObjectId(employeeId);
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
    async updateInvestmentStatus(id, status, commentaire, approvedBy) {
        const investment = await this.investmentModel.findById(id);
        if (!investment) {
            throw new common_1.NotFoundException('Investissement non trouvé');
        }
        investment.status = status;
        investment.commentaire = commentaire || '';
        if (approvedBy) {
            investment.approvedBy = new mongoose_2.Types.ObjectId(approvedBy);
            investment.approvedAt = new Date();
        }
        return investment.save();
    }
    async getDashboardStats() {
        const [totalPayrolls, activeBudgets, activeInvestments, pendingPayrolls] = await Promise.all([
            this.payrollModel.countDocuments(),
            this.budgetModel.countDocuments({ status: budget_schema_1.BudgetStatus.ACTIVE }),
            this.investmentModel.countDocuments({ status: investment_schema_1.InvestmentStatus.ACTIVE }),
            this.payrollModel.countDocuments({ status: payroll_schema_1.PayrollStatus.DRAFT }),
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
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payroll_schema_1.Payroll.name)),
    __param(1, (0, mongoose_1.InjectModel)(budget_schema_1.Budget.name)),
    __param(2, (0, mongoose_1.InjectModel)(investment_schema_1.Investment.name)),
    __param(3, (0, mongoose_1.InjectModel)('Employee')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], FinanceService);
//# sourceMappingURL=finance.service.js.map