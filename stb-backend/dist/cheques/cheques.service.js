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
exports.ChequesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cheques_schema_1 = require("./cheques.schema");
let ChequesService = class ChequesService {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(employeeId, dto) {
        const req = new this.model({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            type: dto.type,
            status: 'PENDING'
        });
        return req.save();
    }
    async findByEmployee(employeeId) {
        return this.model.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
    }
    async findAll() {
        return this.model.find().populate('employeeId', 'nom prenom matricule').sort({ createdAt: -1 }).exec();
    }
    async updateStatus(id, status) {
        const req = await this.model.findByIdAndUpdate(id, { $set: { status } }, { new: true });
        if (!req)
            throw new common_1.NotFoundException('Request not found');
        return req;
    }
};
exports.ChequesService = ChequesService;
exports.ChequesService = ChequesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(cheques_schema_1.ChequeRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ChequesService);
//# sourceMappingURL=cheques.service.js.map