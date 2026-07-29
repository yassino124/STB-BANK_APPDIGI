"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const employee_schema_1 = require("../employees/employee.schema");
const role_schema_1 = require("../roles/schemas/role.schema");
const permission_schema_1 = require("../permissions/schemas/permission.schema");
const department_schema_1 = require("../departments/schemas/department.schema");
const branch_schema_1 = require("../branches/schemas/branch.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const card_schema_1 = require("../cards/schemas/card.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const leave_schema_1 = require("../leave/schemas/leave.schema");
const payroll_schema_1 = require("../payroll/schemas/payroll.schema");
const credit_schema_1 = require("../credits/schemas/credit.schema");
const authorization_schema_1 = require("../authorizations/schemas/authorization.schema");
const request_schema_1 = require("../requests/schemas/request.schema");
const prime_schema_1 = require("../primes/schemas/prime.schema");
const document_schema_1 = require("../documents/schemas/document.schema");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
const device_schema_1 = require("../devices/device.schema");
const session_schema_1 = require("../sessions/session.schema");
const audit_log_schema_1 = require("../audit/audit-log.schema");
const otp_schema_1 = require("../otp/otp.schema");
const setting_schema_1 = require("../settings/schemas/setting.schema");
const analytics_schema_1 = require("../analytics/schemas/analytics.schema");
const report_schema_1 = require("../reports/schemas/report.schema");
const risk_alert_schema_1 = require("../risk_alerts/schemas/risk-alert.schema");
const fraud_detection_schema_1 = require("../fraud_detection/schemas/fraud-detection.schema");
const ai_log_schema_1 = require("../ai_logs/schemas/ai-log.schema");
const activity_log_schema_1 = require("../activity_logs/schemas/activity-log.schema");
const qr_payment_schema_1 = require("../qr_payments/schemas/qr-payment.schema");
const bill_schema_1 = require("../bills/schemas/bill.schema");
const recharge_schema_1 = require("../recharge/schemas/recharge.schema");
const investment_schema_1 = require("../investments/schemas/investment.schema");
const budget_schema_1 = require("../budgets/schemas/budget.schema");
const message_schema_1 = require("../messages/schemas/message.schema");
const conversation_schema_1 = require("../conversations/schemas/conversation.schema");
const beneficiary_schema_1 = require("../beneficiaries/schemas/beneficiary.schema");
const favorite_schema_1 = require("../favorites/schemas/favorite.schema");
const exchange_rate_schema_1 = require("../exchange_rates/schemas/exchange-rate.schema");
const currency_schema_1 = require("../currencies/schemas/currency.schema");
const service_schema_1 = require("../services/schemas/service.schema");
const settings_service_1 = require("../settings/settings.service");
const seed_service_1 = require("./seed.service");
let DatabaseModule = class DatabaseModule {
    settingsService;
    seedService;
    constructor(settingsService, seedService) {
        this.settingsService = settingsService;
        this.seedService = seedService;
    }
    async onModuleInit() {
        await this.seedDefaultSettings();
        await this.seedDefaultData();
    }
    async seedDefaultSettings() {
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
    async seedDefaultData() {
        let existingRoles;
        try {
            existingRoles = await this.settingsService.findByKey('ROLES_SEEDED');
        }
        catch (e) {
            existingRoles = null;
        }
        if (existingRoles)
            return;
        await this.settingsService.setMany({ ROLES_SEEDED: 'true' });
    }
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
                { name: role_schema_1.Role.name, schema: role_schema_1.RoleSchema },
                { name: permission_schema_1.Permission.name, schema: permission_schema_1.PermissionSchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
                { name: branch_schema_1.Branch.name, schema: branch_schema_1.BranchSchema },
                { name: account_schema_1.Account.name, schema: account_schema_1.AccountSchema },
                { name: card_schema_1.Card.name, schema: card_schema_1.CardSchema },
                { name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema },
                { name: leave_schema_1.LeaveRequest.name, schema: leave_schema_1.LeaveRequestSchema },
                { name: leave_schema_1.LeaveBalance.name, schema: leave_schema_1.LeaveBalanceSchema },
                { name: payroll_schema_1.Payroll.name, schema: payroll_schema_1.PayrollSchema },
                { name: credit_schema_1.Credit.name, schema: credit_schema_1.CreditSchema },
                { name: credit_schema_1.CreditPayment.name, schema: credit_schema_1.CreditPaymentSchema },
                { name: authorization_schema_1.Authorization.name, schema: authorization_schema_1.AuthorizationSchema },
                { name: request_schema_1.Request.name, schema: request_schema_1.RequestSchema },
                { name: prime_schema_1.Prime.name, schema: prime_schema_1.PrimeSchema },
                { name: document_schema_1.EmployeeDocument.name, schema: document_schema_1.EmployeeDocumentSchema },
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
                { name: device_schema_1.Device.name, schema: device_schema_1.DeviceSchema },
                { name: session_schema_1.Session.name, schema: session_schema_1.SessionSchema },
                { name: audit_log_schema_1.AuditLog.name, schema: audit_log_schema_1.AuditLogSchema },
                { name: otp_schema_1.Otp.name, schema: otp_schema_1.OtpSchema },
                { name: setting_schema_1.Setting.name, schema: setting_schema_1.SettingSchema },
                { name: analytics_schema_1.Analytics.name, schema: analytics_schema_1.AnalyticsSchema },
                { name: report_schema_1.Report.name, schema: report_schema_1.ReportSchema },
                { name: risk_alert_schema_1.RiskAlert.name, schema: risk_alert_schema_1.RiskAlertSchema },
                { name: fraud_detection_schema_1.FraudDetection.name, schema: fraud_detection_schema_1.FraudDetectionSchema },
                { name: ai_log_schema_1.AiLog.name, schema: ai_log_schema_1.AiLogSchema },
                { name: activity_log_schema_1.ActivityLog.name, schema: activity_log_schema_1.ActivityLogSchema },
                { name: qr_payment_schema_1.QrPayment.name, schema: qr_payment_schema_1.QrPaymentSchema },
                { name: bill_schema_1.Bill.name, schema: bill_schema_1.BillSchema },
                { name: recharge_schema_1.Recharge.name, schema: recharge_schema_1.RechargeSchema },
                { name: investment_schema_1.Investment.name, schema: investment_schema_1.InvestmentSchema },
                { name: budget_schema_1.Budget.name, schema: budget_schema_1.BudgetSchema },
                { name: message_schema_1.Message.name, schema: message_schema_1.MessageSchema },
                { name: conversation_schema_1.Conversation.name, schema: conversation_schema_1.ConversationSchema },
                { name: beneficiary_schema_1.Beneficiary.name, schema: beneficiary_schema_1.BeneficiarySchema },
                { name: favorite_schema_1.Favorite.name, schema: favorite_schema_1.FavoriteSchema },
                { name: exchange_rate_schema_1.ExchangeRate.name, schema: exchange_rate_schema_1.ExchangeRateSchema },
                { name: currency_schema_1.Currency.name, schema: currency_schema_1.CurrencySchema },
                { name: service_schema_1.Service.name, schema: service_schema_1.ServiceSchema },
            ]),
        ],
        providers: [settings_service_1.SettingsService, seed_service_1.SeedService],
        exports: [settings_service_1.SettingsService, seed_service_1.SeedService],
    }),
    __metadata("design:paramtypes", [settings_service_1.SettingsService, seed_service_1.SeedService])
], DatabaseModule);
//# sourceMappingURL=database.module.js.map