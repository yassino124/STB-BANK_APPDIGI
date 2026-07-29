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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const budget_schema_1 = require("./schemas/budget.schema");
let BudgetsService = class BudgetsService {
    budgetModel;
    constructor(budgetModel) {
        this.budgetModel = budgetModel;
    }
    async create(data) {
        return this.budgetModel.create(data);
    }
    async findByEmployee(employeeId) {
        const filter = { isActive: true };
        if (employeeId)
            filter.employeeId = employeeId;
        const docs = await this.budgetModel.find(filter).sort({ createdAt: -1 }).exec();
        return docs.map((d) => {
            const isSavingsGoal = d.type === budget_schema_1.BudgetType.SAVINGS_GOAL;
            const progress = isSavingsGoal ? d.saved : d.spent;
            const percentage = d.amount > 0 ? (progress / d.amount * 100) : 0;
            return {
                _id: d._id,
                name: d.name,
                category: d.category,
                type: d.type || budget_schema_1.BudgetType.SPENDING,
                amount: d.amount,
                spent: d.spent || 0,
                saved: d.saved || 0,
                period: d.period,
                percentage: Math.min(percentage, 100),
                alertThreshold: d.alertThreshold || 80,
                targetDate: d.targetDate,
                description: d.description,
                startDate: d.startDate,
                endDate: d.endDate,
            };
        });
    }
    async findOne(id) {
        const budget = await this.budgetModel.findById(id).exec();
        if (!budget)
            throw new common_1.NotFoundException('Budget not found');
        return budget;
    }
    async update(id, data) {
        const budget = await this.budgetModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!budget)
            throw new common_1.NotFoundException('Budget not found');
        await this.checkAndNotify(budget);
        return budget;
    }
    async updateProgress(id, amount, isSavings = false) {
        const budget = await this.budgetModel.findById(id).exec();
        if (!budget)
            throw new common_1.NotFoundException('Budget not found');
        if (isSavings) {
            budget.saved = (budget.saved || 0) + amount;
        }
        else {
            budget.spent = (budget.spent || 0) + amount;
        }
        await budget.save();
        await this.checkAndNotify(budget);
        return budget;
    }
    async checkAndNotify(budget) {
        const isSavingsGoal = budget.type === budget_schema_1.BudgetType.SAVINGS_GOAL;
        const progress = isSavingsGoal ? budget.saved : budget.spent;
        const percentage = budget.amount > 0 ? (progress / budget.amount * 100) : 0;
        if (percentage >= budget.alertThreshold && !budget.notificationSent) {
            console.log(`🔔 Notification for budget ${budget.name}: ${percentage.toFixed(1)}% achieved`);
            budget.notificationSent = true;
            await budget.save();
        }
        if (percentage < budget.alertThreshold && budget.notificationSent) {
            budget.notificationSent = false;
            await budget.save();
        }
    }
    async remove(id) {
        const budget = await this.budgetModel.findByIdAndDelete(id).exec();
        if (!budget)
            throw new common_1.NotFoundException('Budget not found');
        return { success: true };
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(budget_schema_1.Budget.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map