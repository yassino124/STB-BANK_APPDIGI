import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Budget, BudgetDocument, BudgetType } from './schemas/budget.schema';

@Injectable()
export class BudgetsService {
  constructor(@InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>) {}

  async create(data: Partial<Budget>) {
    return this.budgetModel.create(data);
  }

  async findByEmployee(employeeId?: string) {
    const filter: any = { isActive: true };
    if (employeeId) filter.employeeId = employeeId;
    const docs = await this.budgetModel.find(filter).sort({ createdAt: -1 }).exec();
    
    return docs.map((d: any) => {
      const isSavingsGoal = d.type === BudgetType.SAVINGS_GOAL;
      const progress = isSavingsGoal ? d.saved : d.spent;
      const percentage = d.amount > 0 ? (progress / d.amount * 100) : 0;
      
      return {
        _id: d._id,
        name: d.name,
        category: d.category,
        type: d.type || BudgetType.SPENDING,
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

  async findOne(id: string) {
    const budget = await this.budgetModel.findById(id).exec();
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(id: string, data: Partial<Budget>) {
    const budget = await this.budgetModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!budget) throw new NotFoundException('Budget not found');
    
    // Check if we need to send notification
    await this.checkAndNotify(budget);
    
    return budget;
  }

  async updateProgress(id: string, amount: number, isSavings: boolean = false) {
    const budget = await this.budgetModel.findById(id).exec();
    if (!budget) throw new NotFoundException('Budget not found');
    
    if (isSavings) {
      budget.saved = (budget.saved || 0) + amount;
    } else {
      budget.spent = (budget.spent || 0) + amount;
    }
    
    await budget.save();
    await this.checkAndNotify(budget);
    
    return budget;
  }

  private async checkAndNotify(budget: any) {
    const isSavingsGoal = budget.type === BudgetType.SAVINGS_GOAL;
    const progress = isSavingsGoal ? budget.saved : budget.spent;
    const percentage = budget.amount > 0 ? (progress / budget.amount * 100) : 0;
    
    // Send notification if threshold reached and not already sent
    if (percentage >= budget.alertThreshold && !budget.notificationSent) {
      // TODO: Integrate with notifications system
      console.log(`🔔 Notification for budget ${budget.name}: ${percentage.toFixed(1)}% achieved`);
      budget.notificationSent = true;
      await budget.save();
    }
    
    // Reset notification flag if progress drops below threshold
    if (percentage < budget.alertThreshold && budget.notificationSent) {
      budget.notificationSent = false;
      await budget.save();
    }
  }

  async remove(id: string) {
    const budget = await this.budgetModel.findByIdAndDelete(id).exec();
    if (!budget) throw new NotFoundException('Budget not found');
    return { success: true };
  }
}
