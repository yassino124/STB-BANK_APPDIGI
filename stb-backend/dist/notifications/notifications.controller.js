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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const send_notification_dto_1 = require("./dto/send-notification.dto");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async sendNotification(dto) {
        const result = await this.notificationsService.sendCustomNotification(dto);
        return { success: true, data: result };
    }
    async findMine(req, employeeId) {
        const userId = employeeId || req.user?.sub;
        if (!userId) {
            return { success: false, statusCode: 400, message: 'Employee ID required', data: [] };
        }
        const notifications = await this.notificationsService.getMyNotifications(userId);
        return {
            success: true,
            data: {
                data: notifications,
                total: notifications.length,
                page: 1,
                limit: 100
            }
        };
    }
    async getUnreadCount(req, employeeId) {
        const userId = employeeId || req.user?.sub;
        if (!userId) {
            return { success: false, statusCode: 400, message: 'Employee ID required' };
        }
        const count = await this.notificationsService.getUnreadCount(userId);
        return { success: true, data: { count } };
    }
    async markRead(id) {
        const result = await this.notificationsService.markRead(id);
        return { success: true, data: result };
    }
    async markAllRead(req, employeeId) {
        const userId = employeeId || req.user?.sub;
        if (!userId) {
            return { success: false, statusCode: 400, message: 'Employee ID required' };
        }
        const result = await this.notificationsService.markAllRead(userId);
        return { success: true, data: result };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)('send'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.RH, role_enum_1.Role.FINANCE, role_enum_1.Role.AGENCE, role_enum_1.Role.MANAGER, role_enum_1.Role.ADMIN, role_enum_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Send a custom notification to an employee or all active employees' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.SendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my notifications' }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: false, description: 'Employee ID (temporary fallback)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my unread notifications count' }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: false, description: 'Employee ID (temporary fallback)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markRead", null);
__decorate([
    (0, common_1.Patch)('mark-all-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all my notifications as read' }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: false, description: 'Employee ID (temporary fallback)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllRead", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map