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
exports.CurrenciesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const currency_schema_1 = require("./schemas/currency.schema");
let CurrenciesService = class CurrenciesService {
    currencyModel;
    constructor(currencyModel) {
        this.currencyModel = currencyModel;
    }
    async create(data) {
        const existing = await this.currencyModel.findOne({ code: data.code?.toUpperCase() });
        if (existing)
            throw new common_1.ConflictException('Currency already exists');
        return this.currencyModel.create({ ...data, code: data.code?.toUpperCase() });
    }
    async findAll() {
        return this.currencyModel.find().sort({ code: 1 }).exec();
    }
    async findOne(id) {
        const currency = await this.currencyModel.findById(id).exec();
        if (!currency)
            throw new common_1.NotFoundException('Currency not found');
        return currency;
    }
    async findByCode(code) {
        return this.currencyModel.findOne({ code: code.toUpperCase() }).exec();
    }
    async update(id, data) {
        const currency = await this.currencyModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!currency)
            throw new common_1.NotFoundException('Currency not found');
        return currency;
    }
    async remove(id) {
        const currency = await this.currencyModel.findByIdAndDelete(id).exec();
        if (!currency)
            throw new common_1.NotFoundException('Currency not found');
        return { success: true };
    }
    async seedDefaultCurrencies() {
        const defaults = [
            { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', decimalPlaces: 3 },
            { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
            { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
            { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
        ];
        for (const currency of defaults) {
            await this.currencyModel.findOneAndUpdate({ code: currency.code }, currency, { upsert: true, new: true });
        }
        return this.findAll();
    }
};
exports.CurrenciesService = CurrenciesService;
exports.CurrenciesService = CurrenciesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(currency_schema_1.Currency.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CurrenciesService);
//# sourceMappingURL=currencies.service.js.map