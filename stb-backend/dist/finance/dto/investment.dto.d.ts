import { InvestmentStatus } from '../schemas/investment.schema';
export declare class CreateInvestmentDto {
    employeeId: string;
    name: string;
    amount: number;
    expectedReturn: number;
    commentaire?: string;
}
export declare class UpdateInvestmentStatusDto {
    status: InvestmentStatus;
    commentaire?: string;
}
