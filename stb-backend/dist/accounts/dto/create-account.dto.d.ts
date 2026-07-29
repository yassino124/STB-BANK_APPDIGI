export declare class CreateAccountDto {
    employeeId: string;
    rib: string;
    iban: string;
    numCompte: string;
    type?: string;
    currency?: string;
    branchId?: string;
    isPrimary?: boolean;
    dailyWithdrawalLimit?: number;
    dailyTransferLimit?: number;
    monthlyLimit?: number;
}
