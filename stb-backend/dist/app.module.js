"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const event_emitter_1 = require("@nestjs/event-emitter");
const auth_module_1 = require("./auth/auth.module");
const employees_module_1 = require("./employees/employees.module");
const devices_module_1 = require("./devices/devices.module");
const sessions_module_1 = require("./sessions/sessions.module");
const audit_module_1 = require("./audit/audit.module");
const otp_module_1 = require("./otp/otp.module");
const copilot_module_1 = require("./copilot/copilot.module");
const requests_module_1 = require("./requests/requests.module");
const conges_module_1 = require("./requests/conges.module");
const avances_module_1 = require("./avances/avances.module");
const leave_module_1 = require("./leave/leave.module");
const primes_module_1 = require("./primes/primes.module");
const payroll_module_1 = require("./payroll/payroll.module");
const credits_module_1 = require("./credits/credits.module");
const authorizations_module_1 = require("./authorizations/authorizations.module");
const documents_module_1 = require("./documents/documents.module");
const amicale_module_1 = require("./amicale/amicale.module");
const accounts_module_1 = require("./accounts/accounts.module");
const cards_module_1 = require("./cards/cards.module");
const transactions_module_1 = require("./transactions/transactions.module");
const cheques_module_1 = require("./cheques/cheques.module");
const notifications_module_1 = require("./notifications/notifications.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const scheduler_module_1 = require("./scheduler/scheduler.module");
const roles_module_1 = require("./roles/roles.module");
const permissions_module_1 = require("./permissions/permissions.module");
const departments_module_1 = require("./departments/departments.module");
const branches_module_1 = require("./branches/branches.module");
const services_module_1 = require("./services/services.module");
const currencies_module_1 = require("./currencies/currencies.module");
const exchange_rates_module_1 = require("./exchange_rates/exchange_rates.module");
const beneficiaries_module_1 = require("./beneficiaries/beneficiaries.module");
const favorites_module_1 = require("./favorites/favorites.module");
const qr_payments_module_1 = require("./qr_payments/qr_payments.module");
const bills_module_1 = require("./bills/bills.module");
const recharge_module_1 = require("./recharge/recharge.module");
const investments_module_1 = require("./investments/investments.module");
const budgets_module_1 = require("./budgets/budgets.module");
const messages_module_1 = require("./messages/messages.module");
const conversations_module_1 = require("./conversations/conversations.module");
const ai_logs_module_1 = require("./ai_logs/ai_logs.module");
const activity_logs_module_1 = require("./activity_logs/activity_logs.module");
const settings_module_1 = require("./settings/settings.module");
const analytics_module_1 = require("./analytics/analytics.module");
const reports_module_1 = require("./reports/reports.module");
const risk_alerts_module_1 = require("./risk_alerts/risk_alerts.module");
const fraud_detection_module_1 = require("./fraud_detection/fraud_detection.module");
const tickets_module_1 = require("./tickets/tickets.module");
const hierarchy_module_1 = require("./hierarchy/hierarchy.module");
const absence_module_1 = require("./absence/absence.module");
const finance_module_1 = require("./finance/finance.module");
const queue_module_1 = require("./queue/queue.module");
const firebase_module_1 = require("./firebase/firebase.module");
const realtime_module_1 = require("./realtime/realtime.module");
const database_module_1 = require("./database/database.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.local', '.env.development', '.env.production'],
                load: [
                    () => Promise.resolve().then(() => __importStar(require('./config/database.config'))),
                    () => Promise.resolve().then(() => __importStar(require('./config/jwt.config'))),
                    () => Promise.resolve().then(() => __importStar(require('./config/redis.config'))),
                    () => Promise.resolve().then(() => __importStar(require('./config/swagger.config'))),
                ],
                cache: true,
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            queue_module_1.QueueModule,
            database_module_1.DatabaseModule,
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (config) => ({
                    uri: config.get('MONGODB_URI'),
                    dbName: config.get('MONGODB_DB_NAME', 'stb_db'),
                    ...config.get('database.connectionOptions'),
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => [
                    {
                        ttl: config.get('THROTTLE_TTL', 60),
                        limit: config.get('THROTTLE_LIMIT', 10),
                    },
                ],
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            employees_module_1.EmployeesModule,
            devices_module_1.DevicesModule,
            sessions_module_1.SessionsModule,
            audit_module_1.AuditModule,
            otp_module_1.OtpModule,
            copilot_module_1.CopilotModule,
            hierarchy_module_1.HierarchyModule,
            absence_module_1.AbsenceModule,
            finance_module_1.FinanceModule,
            requests_module_1.RequestsModule,
            conges_module_1.CongesModule,
            avances_module_1.AvancesModule,
            leave_module_1.LeaveModule,
            primes_module_1.PrimesModule,
            payroll_module_1.PayrollModule,
            credits_module_1.CreditsModule,
            authorizations_module_1.AuthorizationsModule,
            documents_module_1.DocumentsModule,
            amicale_module_1.AmicaleModule,
            accounts_module_1.AccountsModule,
            cards_module_1.CardsModule,
            transactions_module_1.TransactionsModule,
            cheques_module_1.ChequesModule,
            notifications_module_1.NotificationsModule,
            dashboard_module_1.DashboardModule,
            scheduler_module_1.SchedulerModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            departments_module_1.DepartmentsModule,
            branches_module_1.BranchesModule,
            services_module_1.ServicesModule,
            currencies_module_1.CurrenciesModule,
            exchange_rates_module_1.ExchangeRatesModule,
            beneficiaries_module_1.BeneficiariesModule,
            favorites_module_1.FavoritesModule,
            qr_payments_module_1.QrPaymentsModule,
            bills_module_1.BillsModule,
            recharge_module_1.RechargeModule,
            investments_module_1.InvestmentsModule,
            budgets_module_1.BudgetsModule,
            messages_module_1.MessagesModule,
            conversations_module_1.ConversationsModule,
            ai_logs_module_1.AiLogsModule,
            activity_logs_module_1.ActivityLogsModule,
            settings_module_1.SettingsModule,
            analytics_module_1.AnalyticsModule,
            reports_module_1.ReportsModule,
            risk_alerts_module_1.RiskAlertsModule,
            fraud_detection_module_1.FraudDetectionModule,
            tickets_module_1.TicketsModule,
            firebase_module_1.FirebaseModule,
            realtime_module_1.RealtimeModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map