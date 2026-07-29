"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const payroll_schema_1 = require("./schemas/payroll.schema");
const budget_schema_1 = require("./schemas/budget.schema");
const investment_schema_1 = require("./schemas/investment.schema");
const finance_service_1 = require("./finance.service");
const finance_controller_1 = require("./finance.controller");
const employees_module_1 = require("../employees/employees.module");
let FinanceModule = class FinanceModule {
};
exports.FinanceModule = FinanceModule;
exports.FinanceModule = FinanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: payroll_schema_1.Payroll.name, schema: payroll_schema_1.Payroll }]),
            mongoose_1.MongooseModule.forFeature([{ name: budget_schema_1.Budget.name, schema: budget_schema_1.Budget }]),
            mongoose_1.MongooseModule.forFeature([{ name: investment_schema_1.Investment.name, schema: investment_schema_1.Investment }]),
            employees_module_1.EmployeesModule,
        ],
        controllers: [finance_controller_1.FinanceController],
        providers: [finance_service_1.FinanceService],
        exports: [finance_service_1.FinanceService],
    })
], FinanceModule);
//# sourceMappingURL=finance.module.js.map