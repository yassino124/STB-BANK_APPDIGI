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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRateSchema = exports.ExchangeRate = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ExchangeRate = class ExchangeRate {
    fromCurrency;
    toCurrency;
    rate;
    effectiveDate;
    metadata;
};
exports.ExchangeRate = ExchangeRate;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Currency', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExchangeRate.prototype, "fromCurrency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Currency', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExchangeRate.prototype, "toCurrency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], ExchangeRate.prototype, "rate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], ExchangeRate.prototype, "effectiveDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ExchangeRate.prototype, "metadata", void 0);
exports.ExchangeRate = ExchangeRate = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'exchange_rates' })
], ExchangeRate);
exports.ExchangeRateSchema = mongoose_1.SchemaFactory.createForClass(ExchangeRate);
exports.ExchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, effectiveDate: -1 }, { unique: true });
//# sourceMappingURL=exchange-rate.schema.js.map