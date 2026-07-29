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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const report_schema_1 = require("./schemas/report.schema");
let ReportsService = class ReportsService {
    reportModel;
    constructor(reportModel) {
        this.reportModel = reportModel;
    }
    async create(data) {
        return this.reportModel.create(data);
    }
    async findAll() {
        return this.reportModel.find().sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const report = await this.reportModel.findById(id).exec();
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        return report;
    }
    async updateStatus(id, status) {
        const report = await this.reportModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        return report;
    }
    async generateReport(reportId) {
        const report = await this.reportModel.findById(reportId).exec();
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        report.status = report_schema_1.ReportStatus.COMPLETED;
        await report.save();
        return report;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(report_schema_1.Report.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ReportsService);
//# sourceMappingURL=reports.service.js.map