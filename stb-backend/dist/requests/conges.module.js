"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CongesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const conges_controller_1 = require("./conges.controller");
const conges_service_1 = require("./conges.service");
const conge_schema_1 = require("./schemas/conge.schema");
const employee_schema_1 = require("../employees/employee.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
let CongesModule = class CongesModule {
};
exports.CongesModule = CongesModule;
exports.CongesModule = CongesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: conge_schema_1.Conge.name, schema: conge_schema_1.CongeSchema },
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
                { name: account_schema_1.Account.name, schema: account_schema_1.AccountSchema },
                { name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema },
            ]),
        ],
        controllers: [conges_controller_1.CongesController],
        providers: [conges_service_1.CongesService],
        exports: [conges_service_1.CongesService],
    })
], CongesModule);
//# sourceMappingURL=conges.module.js.map