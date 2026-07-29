"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const requests_service_1 = require("./requests.service");
const requests_controller_1 = require("./requests.controller");
const request_schema_1 = require("./schemas/request.schema");
const employee_schema_1 = require("../employees/employee.schema");
const realtime_module_1 = require("../realtime/realtime.module");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const notifications_module_1 = require("../notifications/notifications.module");
let RequestsModule = class RequestsModule {
};
exports.RequestsModule = RequestsModule;
exports.RequestsModule = RequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: request_schema_1.Request.name, schema: request_schema_1.RequestSchema },
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
                { name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema },
                { name: account_schema_1.Account.name, schema: account_schema_1.AccountSchema },
            ]),
            realtime_module_1.RealtimeModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [requests_controller_1.RequestsController],
        providers: [requests_service_1.RequestsService],
        exports: [requests_service_1.RequestsService],
    })
], RequestsModule);
//# sourceMappingURL=requests.module.js.map