"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const activity_log_schema_1 = require("./schemas/activity-log.schema");
const activity_logs_service_1 = require("./activity-logs.service");
const activity_logs_controller_1 = require("./activity-logs.controller");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const payroll_schema_1 = require("../payroll/schemas/payroll.schema");
const leave_schema_1 = require("../leave/schemas/leave.schema");
const credit_schema_1 = require("../credits/schemas/credit.schema");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
let ActivityLogsModule = class ActivityLogsModule {
};
exports.ActivityLogsModule = ActivityLogsModule;
exports.ActivityLogsModule = ActivityLogsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: activity_log_schema_1.ActivityLog.name, schema: activity_log_schema_1.ActivityLogSchema },
                { name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema },
                { name: payroll_schema_1.Payroll.name, schema: payroll_schema_1.PayrollSchema },
                { name: leave_schema_1.LeaveRequest.name, schema: leave_schema_1.LeaveRequestSchema },
                { name: credit_schema_1.Credit.name, schema: credit_schema_1.CreditSchema },
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
            ])
        ],
        providers: [activity_logs_service_1.ActivityLogsService],
        controllers: [activity_logs_controller_1.ActivityLogsController],
        exports: [activity_logs_service_1.ActivityLogsService],
    })
], ActivityLogsModule);
//# sourceMappingURL=activity_logs.module.js.map