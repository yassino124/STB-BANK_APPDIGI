export declare class CreateInvestmentDto {
    employeeId: string;
    type: string;
    name: string;
    description?: string;
    initialAmount: number;
    currency?: string;
    startDate: string;
    endDate?: string;
    expectedReturn?: number;
    riskLevel: string;
    accountId?: string;
}
