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
exports.FraudDetectionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const fraud_detection_schema_1 = require("./schemas/fraud-detection.schema");
let FraudDetectionsService = class FraudDetectionsService {
    fraudDetectionModel;
    constructor(fraudDetectionModel) {
        this.fraudDetectionModel = fraudDetectionModel;
    }
    async create(data) {
        return this.fraudDetectionModel.create(data);
    }
    async findByEmployee(employeeId) {
        return this.fraudDetectionModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
    }
    async findHighRisk(threshold = 70) {
        return this.fraudDetectionModel.find({ riskScore: { $gte: threshold }, status: 'INVESTIGATING' }).sort({ riskScore: -1 }).exec();
    }
    async findOne(id) {
        const detection = await this.fraudDetectionModel.findById(id).exec();
        if (!detection)
            throw new common_1.NotFoundException('Fraud detection not found');
        return detection;
    }
    async updateStatus(id, status, assignedTo) {
        const update = { status };
        if (assignedTo)
            update.assignedTo = assignedTo;
        const detection = await this.fraudDetectionModel.findByIdAndUpdate(id, update, { new: true }).exec();
        if (!detection)
            throw new common_1.NotFoundException('Fraud detection not found');
        return detection;
    }
};
exports.FraudDetectionsService = FraudDetectionsService;
exports.FraudDetectionsService = FraudDetectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(fraud_detection_schema_1.FraudDetection.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FraudDetectionsService);
//# sourceMappingURL=fraud-detections.service.js.map