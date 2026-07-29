import { BudgetStatus } from '../schemas/budget.schema';
export declare class CreateBudgetDto {
    name: string;
    department: string;
    amount: number;
    commentaire?: string;
}
export declare class UpdateBudgetProgressDto {
    amount: number;
    isSavings: boolean;
}
export declare class UpdateBudgetStatusDto {
    status: BudgetStatus;
    commentaire?: string;
}
