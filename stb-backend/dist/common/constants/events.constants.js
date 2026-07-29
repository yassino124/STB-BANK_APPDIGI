"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_EVENTS = exports.NOTIFICATION_EVENTS = exports.CREDIT_EVENTS = exports.PAYROLL_EVENTS = exports.LEAVE_EVENTS = exports.EMPLOYEE_EVENTS = exports.TRANSACTION_EVENTS = exports.ACCOUNT_EVENTS = void 0;
exports.ACCOUNT_EVENTS = {
    CREATED: 'account.created',
    CREDITED: 'account.credited',
    DEBITED: 'account.debited',
    FROZEN: 'account.frozen',
    UNFROZEN: 'account.unfrozen',
    CLOSED: 'account.closed',
    CARD_CREATED: 'account.card_created',
    CARD_FROZEN: 'account.card_frozen',
};
exports.TRANSACTION_EVENTS = {
    CREATED: 'transaction.created',
    TRANSFER_COMPLETED: 'transaction.transfer_completed',
    FRAUD_DETECTED: 'transaction.fraud_detected',
    FAILED: 'transaction.failed',
};
exports.EMPLOYEE_EVENTS = {
    CREATED: 'employee.created',
    UPDATED: 'employee.updated',
    ACTIVATED: 'employee.activated',
    SUSPENDED: 'employee.suspended',
    DELETED: 'employee.deleted',
};
exports.LEAVE_EVENTS = {
    REQUESTED: 'leave.requested',
    APPROVED: 'leave.approved',
    REJECTED: 'leave.rejected',
    BALANCE_UPDATED: 'leave.balance_updated',
};
exports.PAYROLL_EVENTS = {
    GENERATED: 'payroll.generated',
    PAID: 'payroll.paid',
    FAILED: 'payroll.failed',
};
exports.CREDIT_EVENTS = {
    CREATED: 'credit.created',
    APPROVED: 'credit.approved',
    REJECTED: 'credit.rejected',
    PAYMENT_PROCESSED: 'credit.payment_processed',
    COMPLETED: 'credit.completed',
};
exports.NOTIFICATION_EVENTS = {
    SENT: 'notification.sent',
    READ: 'notification.read',
    BROADCAST: 'notification.broadcast',
};
exports.QUEUE_EVENTS = {
    PAYROLL_PROCESSED: 'queue.payroll_processed',
    LEAVE_SYNCED: 'queue.leave_synced',
    CREDIT_INSTALLMENT_PROCESSED: 'queue.credit_installment_processed',
    NOTIFICATION_DELIVERED: 'queue.notification_delivered',
};
//# sourceMappingURL=events.constants.js.map