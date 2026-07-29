export declare const ACCOUNT_EVENTS: {
    readonly CREATED: "account.created";
    readonly CREDITED: "account.credited";
    readonly DEBITED: "account.debited";
    readonly FROZEN: "account.frozen";
    readonly UNFROZEN: "account.unfrozen";
    readonly CLOSED: "account.closed";
    readonly CARD_CREATED: "account.card_created";
    readonly CARD_FROZEN: "account.card_frozen";
};
export declare const TRANSACTION_EVENTS: {
    readonly CREATED: "transaction.created";
    readonly TRANSFER_COMPLETED: "transaction.transfer_completed";
    readonly FRAUD_DETECTED: "transaction.fraud_detected";
    readonly FAILED: "transaction.failed";
};
export declare const EMPLOYEE_EVENTS: {
    readonly CREATED: "employee.created";
    readonly UPDATED: "employee.updated";
    readonly ACTIVATED: "employee.activated";
    readonly SUSPENDED: "employee.suspended";
    readonly DELETED: "employee.deleted";
};
export declare const LEAVE_EVENTS: {
    readonly REQUESTED: "leave.requested";
    readonly APPROVED: "leave.approved";
    readonly REJECTED: "leave.rejected";
    readonly BALANCE_UPDATED: "leave.balance_updated";
};
export declare const PAYROLL_EVENTS: {
    readonly GENERATED: "payroll.generated";
    readonly PAID: "payroll.paid";
    readonly FAILED: "payroll.failed";
};
export declare const CREDIT_EVENTS: {
    readonly CREATED: "credit.created";
    readonly APPROVED: "credit.approved";
    readonly REJECTED: "credit.rejected";
    readonly PAYMENT_PROCESSED: "credit.payment_processed";
    readonly COMPLETED: "credit.completed";
};
export declare const NOTIFICATION_EVENTS: {
    readonly SENT: "notification.sent";
    readonly READ: "notification.read";
    readonly BROADCAST: "notification.broadcast";
};
export declare const QUEUE_EVENTS: {
    readonly PAYROLL_PROCESSED: "queue.payroll_processed";
    readonly LEAVE_SYNCED: "queue.leave_synced";
    readonly CREDIT_INSTALLMENT_PROCESSED: "queue.credit_installment_processed";
    readonly NOTIFICATION_DELIVERED: "queue.notification_delivered";
};
