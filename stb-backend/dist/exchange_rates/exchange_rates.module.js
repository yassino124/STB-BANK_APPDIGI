"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRatesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const exchange_rate_schema_1 = require("./schemas/exchange-rate.schema");
const exchange_rates_service_1 = require("./exchange-rates.service");
const exchange_rates_controller_1 = require("./exchange-rates.controller");
let ExchangeRatesModule = class ExchangeRatesModule {
};
exports.ExchangeRatesModule = ExchangeRatesModule;
exports.ExchangeRatesModule = ExchangeRatesModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: exchange_rate_schema_1.ExchangeRate.name, schema: exchange_rate_schema_1.ExchangeRateSchema }])],
        providers: [exchange_rates_service_1.ExchangeRatesService],
        controllers: [exchange_rates_controller_1.ExchangeRatesController],
        exports: [exchange_rates_service_1.ExchangeRatesService],
    })
], ExchangeRatesModule);
//# sourceMappingURL=exchange_rates.module.js.map