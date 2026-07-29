import { OnModuleInit, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from '../employees/employee.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { Department, DepartmentSchema } from '../departments/schemas/department.schema';
import { Branch, BranchSchema } from '../branches/schemas/branch.schema';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { Card, CardSchema } from '../cards/schemas/card.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { LeaveRequest, LeaveRequestSchema, LeaveBalance, LeaveBalanceSchema } from '../leave/schemas/leave.schema';
import { Payroll, PayrollSchema } from '../payroll/schemas/payroll.schema';
import { Credit, CreditSchema, CreditPayment, CreditPaymentSchema } from '../credits/schemas/credit.schema';
import { Authorization, AuthorizationSchema } from '../authorizations/schemas/authorization.schema';
import { Request, RequestSchema } from '../requests/schemas/request.schema';
import { Prime, PrimeSchema } from '../primes/schemas/prime.schema';
import { EmployeeDocument as EmployeeDoc, EmployeeDocumentSchema } from '../documents/schemas/document.schema';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema';
import { Device, DeviceSchema } from '../devices/device.schema';
import { Session, SessionSchema } from '../sessions/session.schema';
import { AuditLog, AuditLogSchema } from '../audit/audit-log.schema';
import { Otp, OtpSchema } from '../otp/otp.schema';
import { Setting, SettingSchema } from '../settings/schemas/setting.schema';
import { Analytics, AnalyticsSchema } from '../analytics/schemas/analytics.schema';
import { Report, ReportSchema } from '../reports/schemas/report.schema';
import { RiskAlert, RiskAlertSchema } from '../risk_alerts/schemas/risk-alert.schema';
import { FraudDetection, FraudDetectionSchema } from '../fraud_detection/schemas/fraud-detection.schema';
import { AiLog, AiLogSchema } from '../ai_logs/schemas/ai-log.schema';
import { ActivityLog, ActivityLogSchema } from '../activity_logs/schemas/activity-log.schema';
import { QrPayment, QrPaymentSchema } from '../qr_payments/schemas/qr-payment.schema';
import { Bill, BillSchema } from '../bills/schemas/bill.schema';
import { Recharge, RechargeSchema } from '../recharge/schemas/recharge.schema';
import { Investment, InvestmentSchema } from '../investments/schemas/investment.schema';
import { Budget, BudgetSchema } from '../budgets/schemas/budget.schema';
import { Message, MessageSchema } from '../messages/schemas/message.schema';
import { Conversation, ConversationSchema } from '../conversations/schemas/conversation.schema';
import { Beneficiary, BeneficiarySchema } from '../beneficiaries/schemas/beneficiary.schema';
import { Favorite, FavoriteSchema } from '../favorites/schemas/favorite.schema';
import { ExchangeRate, ExchangeRateSchema } from '../exchange_rates/schemas/exchange-rate.schema';
import { Currency, CurrencySchema } from '../currencies/schemas/currency.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { SettingsService } from '../settings/settings.service';
import { SeedService } from './seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Branch.name, schema: BranchSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Card.name, schema: CardSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: Payroll.name, schema: PayrollSchema },
      { name: Credit.name, schema: CreditSchema },
      { name: CreditPayment.name, schema: CreditPaymentSchema },
      { name: Authorization.name, schema: AuthorizationSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Prime.name, schema: PrimeSchema },
      { name: EmployeeDoc.name, schema: EmployeeDocumentSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Session.name, schema: SessionSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: Analytics.name, schema: AnalyticsSchema },
      { name: Report.name, schema: ReportSchema },
      { name: RiskAlert.name, schema: RiskAlertSchema },
      { name: FraudDetection.name, schema: FraudDetectionSchema },
      { name: AiLog.name, schema: AiLogSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema },
      { name: QrPayment.name, schema: QrPaymentSchema },
      { name: Bill.name, schema: BillSchema },
      { name: Recharge.name, schema: RechargeSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: Budget.name, schema: BudgetSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Beneficiary.name, schema: BeneficiarySchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: ExchangeRate.name, schema: ExchangeRateSchema },
      { name: Currency.name, schema: CurrencySchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  providers: [SettingsService, SeedService],
  exports: [SettingsService, SeedService],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private settingsService: SettingsService, private seedService: SeedService) {}

  async onModuleInit() {
    await this.seedDefaultSettings();
    await this.seedDefaultData();
  }

  private async seedDefaultSettings() {
    const defaultSettings = [
      { key: 'APP_NAME', value: 'STB Digital Banking', type: 'STRING', category: 'GENERAL', description: 'Application name' },
      { key: 'APP_VERSION', value: '2.0.0', type: 'STRING', category: 'GENERAL', description: 'Application version' },
      { key: 'MAINTENANCE_MODE', value: 'false', type: 'BOOLEAN', category: 'GENERAL', description: 'Maintenance mode flag' },
      { key: 'MAX_LOGIN_ATTEMPTS', value: '5', type: 'NUMBER', category: 'SECURITY', description: 'Maximum login attempts' },
      { key: 'SESSION_TIMEOUT', value: '60', type: 'NUMBER', category: 'SECURITY', description: 'Session timeout in minutes' },
      { key: 'DAILY_TRANSFER_LIMIT', value: '10000', type: 'NUMBER', category: 'BANKING', description: 'Daily transfer limit' },
      { key: 'MONTHLY_TRANSFER_LIMIT', value: '50000', type: 'NUMBER', category: 'BANKING', description: 'Monthly transfer limit' },
      { key: 'PAYROLL_DAY', value: '25', type: 'NUMBER', category: 'HR', description: 'Payroll processing day' },
      { key: 'LEAVE_MONTHLY_ACCRUAL', value: '7.5', type: 'NUMBER', category: 'HR', description: 'Monthly leave accrual days' },
    ];

    for (const setting of defaultSettings) {
      await this.settingsService.setMany({ [setting.key]: setting.value });
    }
  }

  private async seedDefaultData() {
    let existingRoles;
    try {
      existingRoles = await this.settingsService.findByKey('ROLES_SEEDED');
    } catch (e) {
      existingRoles = null;
    }
    if (existingRoles) return;

    // Seed default roles and permissions
    // This would be implemented with the Role and Permission models
    await this.settingsService.setMany({ ROLES_SEEDED: 'true' });
  }
}
