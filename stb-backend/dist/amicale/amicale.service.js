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
exports.AmicaleService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const amicale_schema_1 = require("./amicale.schema");
let AmicaleService = class AmicaleService {
    model;
    constructor(model) {
        this.model = model;
    }
    async findAllActive() {
        return this.model.find({ isActive: true }).sort({ createdAt: -1 }).exec();
    }
    async findAll() {
        return this.model.find().sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const offer = await this.model.findById(id);
        if (!offer)
            throw new common_1.NotFoundException('Offer not found');
        return offer;
    }
    async create(dto) {
        const offer = new this.model(dto);
        return offer.save();
    }
    async update(id, dto) {
        const offer = await this.model.findByIdAndUpdate(id, { $set: dto }, { new: true });
        if (!offer)
            throw new common_1.NotFoundException('Offer not found');
        return offer;
    }
    async remove(id) {
        const offer = await this.model.findByIdAndDelete(id);
        if (!offer)
            throw new common_1.NotFoundException('Offer not found');
        return offer;
    }
};
exports.AmicaleService = AmicaleService;
exports.AmicaleService = AmicaleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(amicale_schema_1.AmicaleOffer.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AmicaleService);
//# sourceMappingURL=amicale.service.js.map