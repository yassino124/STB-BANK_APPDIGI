import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';

// Core
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { DevicesModule } from './devices/devices.module';
import { SessionsModule } from './sessions/sessions.module';
import { AuditModule } from './audit/audit.module';
import { OtpModule } from './otp/otp.module';
import { CopilotModule } from './copilot/copilot.module';
import { AiModule } from './ai/ai.module';

// HR & Finance Modules
import { RequestsModule } from './requests/requests.module';
import { CongesModule } from './requests/conges.module';
import { AvancesModule } from './avances/avances.module';
import { LeaveModule } from './leave/leave.module';
import { PrimesModule } from './primes/primes.module';
import { PayrollModule } from './payroll/payroll.module';
import { CreditsModule } from './credits/credits.module';
import { AuthorizationsModule } from './authorizations/authorizations.module';
import { DocumentsModule } from './documents/documents.module';
import { AmicaleModule } from './amicale/amicale.module';

// Banking Modules
import { AccountsModule } from './accounts/accounts.module';
import { CardsModule } from './cards/cards.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ChequesModule } from './cheques/cheques.module';

// Platform Modules
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SchedulerModule } from './scheduler/scheduler.module';

// Enterprise Modules
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { DepartmentsModule } from './departments/departments.module';
import { BranchesModule } from './branches/branches.module';
import { ServicesModule } from './services/services.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { ExchangeRatesModule } from './exchange_rates/exchange_rates.module';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { FavoritesModule } from './favorites/favorites.module';
import { QrPaymentsModule } from './qr_payments/qr_payments.module';
import { BillsModule } from './bills/bills.module';
import { RechargeModule } from './recharge/recharge.module';
import { InvestmentsModule } from './investments/investments.module';
import { BudgetsModule } from './budgets/budgets.module';
import { MessagesModule } from './messages/messages.module';
import { ConversationsModule } from './conversations/conversations.module';
import { AiLogsModule } from './ai_logs/ai_logs.module';
import { ActivityLogsModule } from './activity_logs/activity_logs.module';
import { SettingsModule } from './settings/settings.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportsModule } from './reports/reports.module';
import { RiskAlertsModule } from './risk_alerts/risk_alerts.module';
import { FraudDetectionModule } from './fraud_detection/fraud_detection.module';
import { TicketsModule } from './tickets/tickets.module';

// Hierarchy
import { HierarchyModule } from './hierarchy/hierarchy.module';

// New Modules
import { AbsenceModule } from './absence/absence.module';
import { FinanceModule } from './finance/finance.module';


// Infrastructure
import { QueueModule } from './queue/queue.module';
import { FirebaseModule } from './firebase/firebase.module';
import { RealtimeModule } from './realtime/realtime.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // ─── Config ────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.development', '.env.production'],
      load: [
        () => import('./config/database.config'),
        () => import('./config/jwt.config'),
        () => import('./config/redis.config'),
        () => import('./config/swagger.config'),
      ],
      cache: true,
    }),

    // ─── Event Emitter ────────────────────────────────────────────
    EventEmitterModule.forRoot(),

    // ─── Queue ────────────────────────────────────────────────────
    QueueModule,

    // ─── Database ──────────────────────────────────────────────────
    DatabaseModule,

    // ─── Database Connection ──────────────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        dbName: config.get<string>('MONGODB_DB_NAME', 'stb_db'),
        ...config.get('database.connectionOptions'),
      }),
      inject: [ConfigService],
    }),

    // ─── Rate Limiting ─────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60),
          limit: config.get<number>('THROTTLE_LIMIT', 10),
        },
      ],
      inject: [ConfigService],
    }),

    // ─── Core Modules ──────────────────────────────────────────────
    AuthModule,
    EmployeesModule,
    DevicesModule,
    SessionsModule,
    AuditModule,
    OtpModule,
    CopilotModule,
    AiModule,
    HierarchyModule,
    AbsenceModule,
    FinanceModule,


    // ─── HR & Finance ───────────────────────────────────────────────
    RequestsModule,
    CongesModule,
    AvancesModule,
    LeaveModule,
    PrimesModule,
    PayrollModule,
    CreditsModule,
    AuthorizationsModule,
    DocumentsModule,
    AmicaleModule,

    // ─── Banking ────────────────────────────────────────────────────
    AccountsModule,
    CardsModule,
    TransactionsModule,
    ChequesModule,

    // ─── Platform ───────────────────────────────────────────────────
    NotificationsModule,
    DashboardModule,
    SchedulerModule,

    // ─── Enterprise Modules ─────────────────────────────────────────
    RolesModule,
    PermissionsModule,
    DepartmentsModule,
    BranchesModule,
    ServicesModule,
    CurrenciesModule,
    ExchangeRatesModule,
    BeneficiariesModule,
    FavoritesModule,
    QrPaymentsModule,
    BillsModule,
    RechargeModule,
    InvestmentsModule,
    BudgetsModule,
    MessagesModule,
    ConversationsModule,
    AiLogsModule,
    ActivityLogsModule,
    SettingsModule,
    AnalyticsModule,
    ReportsModule,
    RiskAlertsModule,
    FraudDetectionModule,
    TicketsModule,

    // ─── Infrastructure ─────────────────────────────────────────────
    FirebaseModule,
    RealtimeModule,
  ],
})
export class AppModule {}
