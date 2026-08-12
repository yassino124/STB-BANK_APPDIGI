"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_controller_1 = require("./dashboard.controller");
const employee_schema_1 = require("../employees/employee.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const card_schema_1 = require("../cards/schemas/card.schema");
const credit_schema_1 = require("../credits/schemas/credit.schema");
const leave_schema_1 = require("../leave/schemas/leave.schema");
const prime_schema_1 = require("../primes/schemas/prime.schema");
const payroll_schema_1 = require("../payroll/schemas/payroll.schema");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
                { name: account_schema_1.Account.name, schema: account_schema_1.AccountSchema },
                { name: card_schema_1.Card.name, schema: card_schema_1.CardSchema },
                { name: credit_schema_1.Credit.name, schema: credit_schema_1.CreditSchema },
                { name: leave_schema_1.LeaveBalance.name, schema: leave_schema_1.LeaveBalanceSchema },
                { name: leave_schema_1.LeaveRequest.name, schema: leave_schema_1.LeaveRequestSchema },
                { name: prime_schema_1.Prime.name, schema: prime_schema_1.PrimeSchema },
                { name: payroll_schema_1.Payroll.name, schema: payroll_schema_1.PayrollSchema },
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
                { name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema },
            ]),
        ],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map