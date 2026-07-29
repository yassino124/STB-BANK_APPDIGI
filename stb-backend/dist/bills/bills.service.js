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
exports.BillsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bill_schema_1 = require("./schemas/bill.schema");
let BillsService = class BillsService {
    billModel;
    constructor(billModel) {
        this.billModel = billModel;
    }
    async create(data) {
        const billData = { ...data };
        if (data.reference && !data.referenceNumber) {
            billData.referenceNumber = data.reference;
            delete billData.reference;
        }
        if (!billData.billerId && billData.billType) {
            billData.billerId = billData.billType;
        }
        billData.status = 'PAID';
        billData.paidAt = new Date();
        console.log('💳 Creating bill:', billData);
        return this.billModel.create(billData);
    }
    async findByEmployee(employeeId) {
        return this.billModel.find({ employeeId }).sort({ dueDate: 1 }).exec();
    }
    async findOne(id) {
        const bill = await this.billModel.findById(id).exec();
        if (!bill)
            throw new common_1.NotFoundException('Bill not found');
        return bill;
    }
    async updateStatus(id, status) {
        const bill = await this.billModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
        if (!bill)
            throw new common_1.NotFoundException('Bill not found');
        return bill;
    }
};
exports.BillsService = BillsService;
exports.BillsService = BillsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(bill_schema_1.Bill.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BillsService);
//# sourceMappingURL=bills.service.js.map