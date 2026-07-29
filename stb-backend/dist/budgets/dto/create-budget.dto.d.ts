export declare class CreateBudgetDto {
    employeeId: string;
    name: string;
    category: string;
    amount: number;
    period: string;
    startDate: string;
    endDate: string;
    currency?: string;
    alertThreshold?: number;
}
