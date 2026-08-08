"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const scheduler_service_1 = require("./scheduler.service");
const employee_schema_1 = require("../employees/employee.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const payroll_module_1 = require("../payroll/payroll.module");
const credits_module_1 = require("../credits/credits.module");
const leave_module_1 = require("../leave/leave.module");
const conges_module_1 = require("../requests/conges.module");
const documents_module_1 = require("../documents/documents.module");
const primes_module_1 = require("../primes/primes.module");
let SchedulerModule = class SchedulerModule {
};
exports.SchedulerModule = SchedulerModule;
exports.SchedulerModule = SchedulerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
                { name: account_schema_1.Account.name, schema: account_schema_1.AccountSchema },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            payroll_module_1.PayrollModule,
            credits_module_1.CreditsModule,
            leave_module_1.LeaveModule,
            conges_module_1.CongesModule,
            documents_module_1.DocumentsModule,
            primes_module_1.PrimesModule,
        ],
        providers: [scheduler_service_1.SchedulerService],
    })
], SchedulerModule);
//# sourceMappingURL=scheduler.module.js.map