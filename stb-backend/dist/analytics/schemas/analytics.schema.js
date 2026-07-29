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
exports.AnalyticsSchema = exports.Analytics = exports.AnalyticsPeriod = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var AnalyticsPeriod;
(function (AnalyticsPeriod) {
    AnalyticsPeriod["DAILY"] = "DAILY";
    AnalyticsPeriod["WEEKLY"] = "WEEKLY";
    AnalyticsPeriod["MONTHLY"] = "MONTHLY";
    AnalyticsPeriod["YEARLY"] = "YEARLY";
})(AnalyticsPeriod || (exports.AnalyticsPeriod = AnalyticsPeriod = {}));
let Analytics = class Analytics {
    employeeId;
    metric;
    value;
    dimensions;
    period;
    startDate;
    endDate;
};
exports.Analytics = Analytics;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', index: true, default: null }),
    __metadata("design:type", Object)
], Analytics.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Analytics.prototype, "metric", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Analytics.prototype, "value", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Analytics.prototype, "dimensions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AnalyticsPeriod, index: true }),
    __metadata("design:type", String)
], Analytics.prototype, "period", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: -1 }),
    __metadata("design:type", Date)
], Analytics.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: -1 }),
    __metadata("design:type", Date)
], Analytics.prototype, "endDate", void 0);
exports.Analytics = Analytics = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'analytics' })
], Analytics);
exports.AnalyticsSchema = mongoose_1.SchemaFactory.createForClass(Analytics);
exports.AnalyticsSchema.index({ employeeId: 1, metric: 1, period: 1, startDate: -1 });
//# sourceMappingURL=analytics.schema.js.map