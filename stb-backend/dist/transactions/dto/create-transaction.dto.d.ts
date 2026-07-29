export declare class CreateTransactionDto {
    employeeId: string;
    montant: number;
    type: string;
    description: string;
    status?: string;
    date?: string;
    from?: string;
    to?: string;
    accountId?: string;
    toAccountId?: string;
    cardId?: string;
    category?: string;
    merchantName?: string;
    location?: string;
}
