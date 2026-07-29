"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const queue_service_1 = require("./queue.service");
const queue_processor_1 = require("./queue.processor");
const notifications_module_1 = require("../notifications/notifications.module");
const payroll_module_1 = require("../payroll/payroll.module");
const credits_module_1 = require("../credits/credits.module");
const leave_module_1 = require("../leave/leave.module");
const reports_module_1 = require("../reports/reports.module");
const ai_logs_module_1 = require("../ai_logs/ai_logs.module");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (config) => ({
                    redis: {
                        host: config.get('redis.host', 'localhost'),
                        port: config.get('redis.port', 6379),
                        password: config.get('redis.password'),
                        db: config.get('redis.db', 0),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            bull_1.BullModule.registerQueue({
                name: 'notifications',
            }),
            bull_1.BullModule.registerQueue({
                name: 'payroll',
            }),
            bull_1.BullModule.registerQueue({
                name: 'credits',
            }),
            bull_1.BullModule.registerQueue({
                name: 'leaves',
            }),
            bull_1.BullModule.registerQueue({
                name: 'reports',
            }),
            bull_1.BullModule.registerQueue({
                name: 'ai',
            }),
            notifications_module_1.NotificationsModule,
            payroll_module_1.PayrollModule,
            credits_module_1.CreditsModule,
            leave_module_1.LeaveModule,
            reports_module_1.ReportsModule,
            ai_logs_module_1.AiLogsModule,
        ],
        providers: [queue_service_1.QueueService, queue_processor_1.QueueProcessor],
        exports: [queue_service_1.QueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map