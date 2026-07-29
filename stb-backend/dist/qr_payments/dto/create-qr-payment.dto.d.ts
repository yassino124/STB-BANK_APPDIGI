export declare class CreateQrPaymentDto {
    employeeId: string;
    type: string;
    amount?: number;
    currency?: string;
    merchantName?: string;
    merchantId?: string;
    qrData: string;
    expiresAt: string;
    accountId: string;
}
