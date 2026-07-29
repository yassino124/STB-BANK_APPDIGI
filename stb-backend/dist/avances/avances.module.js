"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvancesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const avances_controller_1 = require("./avances.controller");
const avances_service_1 = require("./avances.service");
const avance_schema_1 = require("./schemas/avance.schema");
const employee_schema_1 = require("../employees/employee.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const notifications_module_1 = require("../notifications/notifications.module");
let AvancesModule = class AvancesModule {
};
exports.AvancesModule = AvancesModule;
exports.AvancesModule = AvancesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: avance_schema_1.Avance.name, schema: avance_schema_1.AvanceSchema },
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
                { name: account_schema_1.Account.name, schema: account_schema_1.AccountSchema },
                { name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema },
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [avances_controller_1.AvancesController],
        providers: [avances_service_1.AvancesService],
        exports: [avances_service_1.AvancesService],
    })
], AvancesModule);
//# sourceMappingURL=avances.module.js.map