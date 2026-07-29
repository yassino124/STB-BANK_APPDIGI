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
exports.BeneficiariesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const beneficiary_schema_1 = require("./schemas/beneficiary.schema");
let BeneficiariesService = class BeneficiariesService {
    beneficiaryModel;
    constructor(beneficiaryModel) {
        this.beneficiaryModel = beneficiaryModel;
    }
    async create(employeeId, data) {
        const existing = await this.beneficiaryModel.findOne({
            employeeId,
            rib: data.rib,
        });
        if (existing)
            throw new common_1.ConflictException('Beneficiary with this RIB already exists');
        return this.beneficiaryModel.create({ ...data, employeeId });
    }
    async findByEmployee(employeeId) {
        return this.beneficiaryModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
    }
    async findFavorites(employeeId) {
        return this.beneficiaryModel.find({ employeeId, isFavorite: true }).sort({ createdAt: -1 }).exec();
    }
    async update(id, data) {
        const beneficiary = await this.beneficiaryModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!beneficiary)
            throw new common_1.NotFoundException('Beneficiary not found');
        return beneficiary;
    }
    async remove(id) {
        const beneficiary = await this.beneficiaryModel.findByIdAndDelete(id).exec();
        if (!beneficiary)
            throw new common_1.NotFoundException('Beneficiary not found');
        return { success: true };
    }
};
exports.BeneficiariesService = BeneficiariesService;
exports.BeneficiariesService = BeneficiariesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(beneficiary_schema_1.Beneficiary.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BeneficiariesService);
//# sourceMappingURL=beneficiaries.service.js.map