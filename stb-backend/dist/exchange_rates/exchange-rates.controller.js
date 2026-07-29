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
exports.ExchangeRatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const exchange_rates_service_1 = require("./exchange-rates.service");
let ExchangeRatesController = class ExchangeRatesController {
    exchangeRatesService;
    constructor(exchangeRatesService) {
        this.exchangeRatesService = exchangeRatesService;
    }
    create(data) {
        return this.exchangeRatesService.create(data);
    }
    findAll() {
        return this.exchangeRatesService.findAll();
    }
    findLatest(from, to) {
        return this.exchangeRatesService.findLatest(from, to);
    }
    findHistory(from, to, limit = 30) {
        return this.exchangeRatesService.findHistory(from, to, +limit);
    }
    convert(amount, from, to) {
        return this.exchangeRatesService.convert(amount, from, to);
    }
};
exports.ExchangeRatesController = ExchangeRatesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create exchange rate' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all exchange rates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('latest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest exchange rate' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: true }),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "findLatest", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exchange rate history' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "findHistory", null);
__decorate([
    (0, common_1.Post)('convert'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert currency' }),
    (0, swagger_1.ApiQuery)({ name: 'amount', required: true, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: true }),
    __param(0, (0, common_1.Query)('amount')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "convert", null);
exports.ExchangeRatesController = ExchangeRatesController = __decorate([
    (0, swagger_1.ApiTags)('💱 Exchange Rates'),
    (0, common_1.Controller)('exchange-rates'),
    __metadata("design:paramtypes", [exchange_rates_service_1.ExchangeRatesService])
], ExchangeRatesController);
//# sourceMappingURL=exchange-rates.controller.js.map