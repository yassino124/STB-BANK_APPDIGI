"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrPaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const qr_payment_schema_1 = require("./schemas/qr-payment.schema");
const qr_payments_service_1 = require("./qr-payments.service");
const qr_payments_controller_1 = require("./qr_payments.controller");
let QrPaymentsModule = class QrPaymentsModule {
};
exports.QrPaymentsModule = QrPaymentsModule;
exports.QrPaymentsModule = QrPaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: qr_payment_schema_1.QrPayment.name, schema: qr_payment_schema_1.QrPaymentSchema }])],
        providers: [qr_payments_service_1.QrPaymentsService],
        controllers: [qr_payments_controller_1.QrPaymentsController],
        exports: [qr_payments_service_1.QrPaymentsService],
    })
], QrPaymentsModule);
//# sourceMappingURL=qr_payments.module.js.map