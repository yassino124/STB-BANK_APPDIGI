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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const analytics_schema_1 = require("./schemas/analytics.schema");
let AnalyticsService = class AnalyticsService {
    analyticsModel;
    constructor(analyticsModel) {
        this.analyticsModel = analyticsModel;
    }
    async create(data) {
        return this.analyticsModel.create(data);
    }
    async findAll(period, metric) {
        const query = {};
        if (period)
            query.period = period;
        if (metric)
            query.metric = metric;
        return this.analyticsModel.find(query).sort({ startDate: -1 }).exec();
    }
    async findByEmployee(employeeId, metric) {
        const query = { employeeId };
        if (metric)
            query.metric = metric;
        return this.analyticsModel.find(query).sort({ startDate: -1 }).exec();
    }
    async findAggregates(metric, startDate, endDate) {
        return this.analyticsModel.aggregate([
            { $match: { metric, startDate: { $gte: startDate }, endDate: { $lte: endDate } } },
            {
                $group: {
                    _id: '$employeeId',
                    total: { $sum: '$value' },
                    avg: { $avg: '$value' },
                    count: { $sum: 1 },
                },
            },
        ]).exec();
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(analytics_schema_1.Analytics.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map