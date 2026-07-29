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
exports.InvestmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const investment_schema_1 = require("./schemas/investment.schema");
let InvestmentsService = class InvestmentsService {
    investmentModel;
    constructor(investmentModel) {
        this.investmentModel = investmentModel;
    }
    async create(data) {
        return this.investmentModel.create(data);
    }
    async findByEmployee(employeeId) {
        const filter = {};
        if (employeeId)
            filter.employeeId = employeeId;
        const docs = await this.investmentModel.find(filter).sort({ createdAt: -1 }).exec();
        return docs.map((d) => ({
            _id: d._id,
            name: d.name,
            type: d.type,
            amount: d.initialAmount,
            returns: d.currentValue - d.initialAmount,
            roi: d.initialAmount > 0 ? ((d.currentValue - d.initialAmount) / d.initialAmount) * 100 : 0,
            status: d.status,
            startDate: d.startDate,
            riskLevel: d.riskLevel,
        }));
    }
    async findOne(id) {
        const investment = await this.investmentModel.findById(id).exec();
        if (!investment)
            throw new common_1.NotFoundException('Investment not found');
        return investment;
    }
    async update(id, data) {
        const investment = await this.investmentModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!investment)
            throw new common_1.NotFoundException('Investment not found');
        return investment;
    }
};
exports.InvestmentsService = InvestmentsService;
exports.InvestmentsService = InvestmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(investment_schema_1.Investment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], InvestmentsService);
//# sourceMappingURL=investments.service.js.map