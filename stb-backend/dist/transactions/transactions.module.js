"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const transactions_service_1 = require("./transactions.service");
const transactions_controller_1 = require("./transactions.controller");
const transaction_schema_1 = require("./schemas/transaction.schema");
const employee_schema_1 = require("../employees/employee.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const card_schema_1 = require("../cards/schemas/card.schema");
const accounts_module_1 = require("../accounts/accounts.module");
let TransactionsModule = class TransactionsModule {
};
exports.TransactionsModule = TransactionsModule;
exports.TransactionsModule = TransactionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema },
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
                { name: account_schema_1.Account.name, schema: account_schema_1.AccountSchema },
                { name: card_schema_1.Card.name, schema: card_schema_1.CardSchema },
            ]),
            (0, common_1.forwardRef)(() => accounts_module_1.AccountsModule),
        ],
        controllers: [transactions_controller_1.TransactionsController],
        providers: [transactions_service_1.TransactionsService],
        exports: [transactions_service_1.TransactionsService],
    })
], TransactionsModule);
//# sourceMappingURL=transactions.module.js.map