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
var NotificationsConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsConsumer = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const notifications_service_1 = require("../notifications/notifications.service");
let NotificationsConsumer = NotificationsConsumer_1 = class NotificationsConsumer {
    notificationsService;
    logger = new common_1.Logger(NotificationsConsumer_1.name);
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async process(job) {
        this.logger.log(`Processing notification job ${job.id}`);
        const { employeeId, title, body, type, data } = job.data;
        try {
            await this.notificationsService.sendToEmployee(employeeId, title, body, type, data);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Notification job ${job.id} failed: ${error.message}`);
            throw error;
        }
    }
};
exports.NotificationsConsumer = NotificationsConsumer;
exports.NotificationsConsumer = NotificationsConsumer = NotificationsConsumer_1 = __decorate([
    (0, bull_1.Processor)('notifications'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsConsumer);
//# sourceMappingURL=notifications.consumer.js.map