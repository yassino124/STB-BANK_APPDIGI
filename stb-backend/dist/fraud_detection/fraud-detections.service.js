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
    async findAll(limit = 50) {
        return this.fraudDetectionModel
            .find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('employeeId', 'nom prenom matricule roles departement')
            .exec();
    }
    async findByEmployee(employeeId) {
        return this.fraudDetectionModel
            .find({ employeeId })
            .sort({ createdAt: -1 })
            .populate('employeeId', 'nom prenom matricule')
            .exec();
    }
    async findHighRisk(threshold = 70) {
        return this.fraudDetectionModel
            .find({ riskScore: { $gte: threshold } })
            .sort({ riskScore: -1 })
            .populate('employeeId', 'nom prenom matricule')
            .exec();
    }
    async getSummary() {
        const [total, highRisk, investigating, confirmed, dismissed] = await Promise.all([
            this.fraudDetectionModel.countDocuments(),
            this.fraudDetectionModel.countDocuments({ riskScore: { $gte: 70 } }),
            this.fraudDetectionModel.countDocuments({ status: fraud_detection_schema_1.FraudStatus.INVESTIGATING }),
            this.fraudDetectionModel.countDocuments({ status: fraud_detection_schema_1.FraudStatus.CONFIRMED }),
            this.fraudDetectionModel.countDocuments({ status: fraud_detection_schema_1.FraudStatus.DISMISSED }),
        ]);
        const avgScoreResult = await this.fraudDetectionModel.aggregate([
            { $group: { _id: null, avgScore: { $avg: '$riskScore' } } },
        ]);
        const avgScore = avgScoreResult[0]?.avgScore ?? 0;
        return {
            total,
            highRisk,
            investigating,
            confirmed,
            dismissed,
            avgScore: Math.round(avgScore),
            pending: total - confirmed - dismissed,
        };
    }
    async getMonthlyStats(months = 6) {
        const since = new Date();
        since.setMonth(since.getMonth() - months);
        const result = await this.fraudDetectionModel.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    total: { $sum: 1 },
                    confirmed: { $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0] } },
                    highRisk: { $sum: { $cond: [{ $gte: ['$riskScore', 70] }, 1, 0] } },
                    avgScore: { $avg: '$riskScore' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        return result.map((r) => ({
            month: monthNames[r._id.month - 1],
            year: r._id.year,
            total: r.total,
            confirmed: r.confirmed,
            highRisk: r.highRisk,
            avgScore: Math.round(r.avgScore),
        }));
    }
    async getByType() {
        return this.fraudDetectionModel.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$riskScore' },
                },
            },
            { $sort: { count: -1 } },
        ]);
    }
    async findOne(id) {
        const detection = await this.fraudDetectionModel
            .findById(id)
            .populate('employeeId', 'nom prenom matricule roles')
            .exec();
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