"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrPaymentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const qr_payment_schema_1 = require("./schemas/qr-payment.schema");
let QrPaymentsService = class QrPaymentsService {
    qrPaymentModel;
    constructor(qrPaymentModel) {
        this.qrPaymentModel = qrPaymentModel;
    }
    async create(data) {
        return this.qrPaymentModel.create(data);
    }
    async findByEmployee(employeeId, limit = 50) {
        return this.qrPaymentModel.find({ employeeId }).sort({ createdAt: -1 }).limit(limit).exec();
    }
    async findOne(id) {
        const qrPayment = await this.qrPaymentModel.findById(id).exec();
        if (!qrPayment)
            throw new common_1.NotFoundException('QR Payment not found');
        return qrPayment;
    }
    async updateStatus(id, status) {
        const qrPayment = await this.qrPaymentModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
        if (!qrPayment)
            throw new common_1.NotFoundException('QR Payment not found');
        return qrPayment;
    }
};
exports.QrPaymentsService = QrPaymentsService;
exports.QrPaymentsService = QrPaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(qr_payment_schema_1.QrPayment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], QrPaymentsService);
//# sourceMappingURL=qr-payments.service.js.map