export const ACCOUNT_EVENTS = {
  CREATED: 'account.created',
  CREDITED: 'account.credited',
  DEBITED: 'account.debited',
  FROZEN: 'account.frozen',
  UNFROZEN: 'account.unfrozen',
  CLOSED: 'account.closed',
  CARD_CREATED: 'account.card_created',
  CARD_FROZEN: 'account.card_frozen',
} as const;

export const TRANSACTION_EVENTS = {
  CREATED: 'transaction.created',
  TRANSFER_COMPLETED: 'transaction.transfer_completed',
  FRAUD_DETECTED: 'transaction.fraud_detected',
  FAILED: 'transaction.failed',
} as const;

export const EMPLOYEE_EVENTS = {
  CREATED: 'employee.created',
  UPDATED: 'employee.updated',
  ACTIVATED: 'employee.activated',
  SUSPENDED: 'employee.suspended',
  DELETED: 'employee.deleted',
} as const;

export const LEAVE_EVENTS = {
  REQUESTED: 'leave.requested',
  APPROVED: 'leave.approved',
  REJECTED: 'leave.rejected',
  BALANCE_UPDATED: 'leave.balance_updated',
} as const;

export const PAYROLL_EVENTS = {
  GENERATED: 'payroll.generated',
  PAID: 'payroll.paid',
  FAILED: 'payroll.failed',
} as const;

export const CREDIT_EVENTS = {
  CREATED: 'credit.created',
  APPROVED: 'credit.approved',
  REJECTED: 'credit.rejected',
  PAYMENT_PROCESSED: 'credit.payment_processed',
  COMPLETED: 'credit.completed',
} as const;

export const NOTIFICATION_EVENTS = {
  SENT: 'notification.sent',
  READ: 'notification.read',
  BROADCAST: 'notification.broadcast',
} as const;

export const QUEUE_EVENTS = {
  PAYROLL_PROCESSED: 'queue.payroll_processed',
  LEAVE_SYNCED: 'queue.leave_synced',
  CREDIT_INSTALLMENT_PROCESSED: 'queue.credit_installment_processed',
  NOTIFICATION_DELIVERED: 'queue.notification_delivered',
} as const;
