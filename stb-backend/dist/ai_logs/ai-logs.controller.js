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
exports.AiLogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_logs_service_1 = require("./ai-logs.service");
let AiLogsController = class AiLogsController {
    aiLogsService;
    constructor(aiLogsService) {
        this.aiLogsService = aiLogsService;
    }
    create(data) {
        return this.aiLogsService.create(data);
    }
    findBySession(sessionId) {
        return this.aiLogsService.findBySession(sessionId);
    }
    findByEmployee(employeeId, limit = 100) {
        return this.aiLogsService.findByEmployee(employeeId, +limit);
    }
    getStats(employeeId) {
        return this.aiLogsService.findStats(employeeId);
    }
};
exports.AiLogsController = AiLogsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create AI log' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI logs by session' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiLogsController.prototype, "findBySession", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI logs by employee' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AiLogsController.prototype, "findByEmployee", null);
__decorate([
    (0, common_1.Get)('stats/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI usage stats' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiLogsController.prototype, "getStats", null);
exports.AiLogsController = AiLogsController = __decorate([
    (0, swagger_1.ApiTags)('🤖 AI Logs'),
    (0, common_1.Controller)('ai-logs'),
    __metadata("design:paramtypes", [ai_logs_service_1.AiLogsService])
], AiLogsController);
//# sourceMappingURL=ai-logs.controller.js.map