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
exports.RiskAlertsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const risk_alert_schema_1 = require("./schemas/risk-alert.schema");
let RiskAlertsService = class RiskAlertsService {
    riskAlertModel;
    constructor(riskAlertModel) {
        this.riskAlertModel = riskAlertModel;
    }
    async create(data) {
        return this.riskAlertModel.create(data);
    }
    async findByEmployee(employeeId) {
        return this.riskAlertModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
    }
    async findOpen() {
        return this.riskAlertModel.find({ status: 'OPEN' }).sort({ severity: -1, createdAt: -1 }).exec();
    }
    async findOne(id) {
        const alert = await this.riskAlertModel.findById(id).exec();
        if (!alert)
            throw new common_1.NotFoundException('Risk alert not found');
        return alert;
    }
    async updateStatus(id, status, resolvedBy) {
        const update = { status };
        if (status === 'RESOLVED' || status === 'FALSE_POSITIVE') {
            update.resolvedAt = new Date();
            if (resolvedBy)
                update.resolvedBy = resolvedBy;
        }
        const alert = await this.riskAlertModel.findByIdAndUpdate(id, update, { new: true }).exec();
        if (!alert)
            throw new common_1.NotFoundException('Risk alert not found');
        return alert;
    }
};
exports.RiskAlertsService = RiskAlertsService;
exports.RiskAlertsService = RiskAlertsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(risk_alert_schema_1.RiskAlert.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RiskAlertsService);
//# sourceMappingURL=risk-alerts.service.js.map