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
exports.ExchangeRatesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const exchange_rate_schema_1 = require("./schemas/exchange-rate.schema");
let ExchangeRatesService = class ExchangeRatesService {
    exchangeRateModel;
    constructor(exchangeRateModel) {
        this.exchangeRateModel = exchangeRateModel;
    }
    async create(data) {
        return this.exchangeRateModel.create(data);
    }
    async findLatest(fromCurrency, toCurrency) {
        return this.exchangeRateModel
            .findOne({ fromCurrency, toCurrency })
            .sort({ effectiveDate: -1 })
            .exec();
    }
    async findHistory(fromCurrency, toCurrency, limit = 30) {
        return this.exchangeRateModel
            .find({ fromCurrency, toCurrency })
            .sort({ effectiveDate: -1 })
            .limit(limit)
            .exec();
    }
    async findAll() {
        return this.exchangeRateModel.find().sort({ fromCurrency: 1, effectiveDate: -1 }).exec();
    }
    async convert(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency)
            return amount;
        const rate = await this.findLatest(fromCurrency, toCurrency);
        if (!rate)
            throw new common_1.NotFoundException(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
        return amount * rate.rate;
    }
};
exports.ExchangeRatesService = ExchangeRatesService;
exports.ExchangeRatesService = ExchangeRatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(exchange_rate_schema_1.ExchangeRate.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ExchangeRatesService);
//# sourceMappingURL=exchange-rates.service.js.map