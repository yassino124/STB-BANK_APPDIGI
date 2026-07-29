export declare class CreateCardDto {
    employeeId: string;
    accountId: string;
    cardNumber: string;
    maskedNumber: string;
    expiryDate: string;
    cvvHash: string;
    pinHash?: string;
    type?: string;
    limitQuotidien?: number;
    limitMensuel?: number;
    isVirtual?: boolean;
    contactlessEnabled?: boolean;
    onlinePaymentsEnabled?: boolean;
    internationalEnabled?: boolean;
}
