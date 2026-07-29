export declare class CreateBillDto {
    employeeId: string;
    billerId: string;
    billerName: string;
    billType: string;
    referenceNumber: string;
    amount: number;
    currency?: string;
    dueDate?: string;
    accountId?: string;
}
