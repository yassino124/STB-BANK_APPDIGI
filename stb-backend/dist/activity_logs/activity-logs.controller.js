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
exports.ActivityLogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const activity_logs_service_1 = require("./activity-logs.service");
let ActivityLogsController = class ActivityLogsController {
    activityLogsService;
    constructor(activityLogsService) {
        this.activityLogsService = activityLogsService;
    }
    create(data) {
        return this.activityLogsService.create(data);
    }
    findByEmployee(employeeId, limit = 100) {
        return this.activityLogsService.findByEmployee(employeeId, +limit);
    }
    findByModule(module, limit = 100) {
        return this.activityLogsService.findByModule(module, +limit);
    }
    findRecent(limit = 100) {
        return this.activityLogsService.findRecent(+limit);
    }
};
exports.ActivityLogsController = ActivityLogsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create activity log' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ActivityLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get activity logs by employee' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActivityLogsController.prototype, "findByEmployee", null);
__decorate([
    (0, common_1.Get)('module/:module'),
    (0, swagger_1.ApiOperation)({ summary: 'Get activity logs by module' }),
    __param(0, (0, common_1.Param)('module')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActivityLogsController.prototype, "findByModule", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent activity logs' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ActivityLogsController.prototype, "findRecent", null);
exports.ActivityLogsController = ActivityLogsController = __decorate([
    (0, swagger_1.ApiTags)('📋 Activity Logs'),
    (0, common_1.Controller)('activity-logs'),
    __metadata("design:paramtypes", [activity_logs_service_1.ActivityLogsService])
], ActivityLogsController);
//# sourceMappingURL=activity-logs.controller.js.map