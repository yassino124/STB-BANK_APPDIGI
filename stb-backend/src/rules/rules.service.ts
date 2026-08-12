import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessRule } from './schemas/rules.schema';
import { evaluate } from 'mathjs';

@Injectable()
export class RulesService implements OnModuleInit {
  private readonly logger = new Logger(RulesService.name);
  private cachedRules: Record<string, any> = {};

  constructor(
    @InjectModel(BusinessRule.name) private ruleModel: Model<BusinessRule>
  ) {}

  async onModuleInit() {
    await this.loadRules();
  }

  async loadRules() {
    const doc = await this.ruleModel.findOne({ scope: 'GLOBAL' });
    // Always ensure the workflow includes all 4 levels: MANAGER, DIRECTOR, DG, RH
    const correctWorkflow = ["MANAGER", "DIRECTOR", "DG", "RH"];
    
    if (doc) {
      // Migrate: update workflow if it doesn't include DG
      if (!doc.config?.leave?.workflow?.includes('DG')) {
        doc.config = {
          ...doc.config,
          leave: { ...doc.config.leave, workflow: correctWorkflow },
        };
        await this.ruleModel.updateOne({ scope: 'GLOBAL' }, { $set: { config: doc.config } });
        this.logger.log('Migrated leave workflow to include DG level');
      }
      this.cachedRules = doc.config || {};
      this.logger.log('Business rules loaded successfully from DB');
    } else {
      // Default initial rules
      const defaultRules = {
        leave: { 
          maxDays: 30, 
          minNotice: 2,
          policies: [
            { condition: "days <= 5", requiredApprovals: ["MANAGER"] },
            { condition: "days > 5", requiredApprovals: ["MANAGER", "DIRECTOR"] }
          ],
          workflow: correctWorkflow,
        },
        advance: { 
          maxPercent: 40,
          formula: "salary * 0.40"
        },
        credit: { 
          formula: "salary * 6",
          policies: [
            { condition: "amount <= 5000", requiredApprovals: ["FINANCE"] },
            { condition: "amount > 5000 and amount <= 20000", requiredApprovals: ["FINANCE", "DIRECTOR"] },
            { condition: "amount > 20000", requiredApprovals: ["FINANCE", "DIRECTOR", "DG"] }
          ],
          workflow: ["MANAGER", "FINANCE", "DIRECTOR"]
        },
        prime: { 
          formula: "salary * 0.20",
          fixed: {
            "ramadan": 500,
            "aid": 300
          }
        }
      };
      
      await this.ruleModel.create({ scope: 'GLOBAL', config: defaultRules });
      this.cachedRules = defaultRules;
      this.logger.log('Default business rules created');
    }
  }

  getRules() {
    return this.cachedRules;
  }

  getRule(path: string, defaultValue?: any) {
    const keys = path.split('.');
    let result = this.cachedRules;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }
    return result;
  }

  async updateRules(newConfig: Record<string, any>) {
    const doc = await this.ruleModel.findOneAndUpdate(
      { scope: 'GLOBAL' },
      { $set: { config: newConfig } },
      { new: true, upsert: true }
    );
    this.cachedRules = doc.config;
    return this.cachedRules;
  }

  // --- Formula Engine ---
  evaluateFormula(formula: string, scope: Record<string, any>): number {
    try {
      // Use mathjs to evaluate formulas safely (e.g. "salary * 0.4", scope = { salary: 2500 })
      return evaluate(formula, scope);
    } catch (err) {
      this.logger.error(`Error evaluating formula [${formula}] with scope ${JSON.stringify(scope)}:`, err.message);
      return 0; // Fallback safe value
    }
  }

  // --- Policy Engine ---
  evaluatePolicy(domain: string, scope: Record<string, any>): string[] {
    const policies = this.getRule(`${domain}.policies`, []);
    
    // Sort policies if needed, or just find the matching one
    // For simplicity, we assume policies are evaluated in order and the first matching condition returns the approvals
    for (const policy of policies) {
      try {
        // e.g., condition: "days > 5", scope: { days: 6 }
        // mathjs evaluate can also handle boolean conditions: evaluate("days > 5", { days: 6 }) returns true
        const isMatch = evaluate(policy.condition, scope);
        if (isMatch) {
          return policy.requiredApprovals; // e.g. ["MANAGER", "DIRECTOR"]
        }
      } catch (err) {
        this.logger.error(`Error evaluating policy condition [${policy.condition}]:`, err.message);
      }
    }
    
    // Default fallback
    return ["MANAGER"];
  }
}
