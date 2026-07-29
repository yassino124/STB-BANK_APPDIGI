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
exports.AiLogsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ai_log_schema_1 = require("./schemas/ai-log.schema");
let AiLogsService = class AiLogsService {
    aiLogModel;
    constructor(aiLogModel) {
        this.aiLogModel = aiLogModel;
    }
    async create(data) {
        return this.aiLogModel.create(data);
    }
    async findBySession(sessionId) {
        return this.aiLogModel.find({ sessionId }).sort({ createdAt: -1 }).exec();
    }
    async findByEmployee(employeeId, limit = 100) {
        return this.aiLogModel.find({ employeeId }).sort({ createdAt: -1 }).limit(limit).exec();
    }
    async findStats(employeeId) {
        const [total, successCount, failureCount] = await Promise.all([
            this.aiLogModel.countDocuments({ employeeId }),
            this.aiLogModel.countDocuments({ employeeId, success: true }),
            this.aiLogModel.countDocuments({ employeeId, success: false }),
        ]);
        return { total, successCount, failureCount, successRate: total > 0 ? (successCount / total) * 100 : 0 };
    }
};
exports.AiLogsService = AiLogsService;
exports.AiLogsService = AiLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ai_log_schema_1.AiLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AiLogsService);
//# sourceMappingURL=ai-logs.service.js.map