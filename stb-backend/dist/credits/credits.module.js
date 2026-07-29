"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const credits_service_1 = require("./credits.service");
const credits_controller_1 = require("./credits.controller");
const credit_schema_1 = require("./schemas/credit.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const employee_schema_1 = require("../employees/employee.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const notifications_module_1 = require("../notifications/notifications.module");
let CreditsModule = class CreditsModule {
};
exports.CreditsModule = CreditsModule;
exports.CreditsModule = CreditsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: credit_schema_1.Credit.name, schema: credit_schema_1.CreditSchema },
                { name: credit_schema_1.CreditPayment.name, schema: credit_schema_1.CreditPaymentSchema },
                { name: account_schema_1.Account.name, schema: account_schema_1.AccountSchema },
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
                { name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema },
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [credits_controller_1.CreditsController],
        providers: [credits_service_1.CreditsService],
        exports: [credits_service_1.CreditsService],
    })
], CreditsModule);
//# sourceMappingURL=credits.module.js.map