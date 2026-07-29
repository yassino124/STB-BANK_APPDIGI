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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const notifications_service_1 = require("./notifications.service");
const events_constants_1 = require("../common/constants/events.constants");
const notification_schema_1 = require("./schemas/notification.schema");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let NotificationsListener = class NotificationsListener {
    notificationsService;
    realtimeGateway;
    constructor(notificationsService, realtimeGateway) {
        this.notificationsService = notificationsService;
        this.realtimeGateway = realtimeGateway;
    }
    async handleTransferCompleted(payload) {
        console.log('📦 Transfer event payload:', JSON.stringify(payload));
        const { fromEmployeeId, toEmployeeId, montant, transactionId, reference } = payload;
        const senderNotif = await this.notificationsService.sendToEmployee(fromEmployeeId.toString(), 'Transfert effectué', `Vous avez envoyé ${montant} TND`, notification_schema_1.NotificationType.TRANSACTION, {
            transactionId: transactionId.toString(),
            amount: montant,
            direction: 'out',
        });
        this.realtimeGateway.server?.to(`user:${fromEmployeeId}`).emit('notification', senderNotif);
        const receiverNotif = await this.notificationsService.sendToEmployee(toEmployeeId.toString(), 'Transfert reçu', `Vous avez reçu ${montant} TND`, notification_schema_1.NotificationType.TRANSACTION, {
            transactionId: transactionId.toString(),
            amount: montant,
            direction: 'in',
        });
        this.realtimeGateway.server?.to(`user:${toEmployeeId}`).emit('notification', receiverNotif);
        console.log(`✅ Created 2 notifications and sent realtime events for transfer ${transactionId}`);
    }
    async handleFraudDetected(payload) {
        const { transactionId, employeeId, riskScore } = payload;
        const notif = await this.notificationsService.sendToEmployee(employeeId.toString(), '⚠️ Transaction suspecte', `Une activité inhabituelle a été détectée sur votre compte (Score: ${riskScore})`, notification_schema_1.NotificationType.SYSTEM, {
            transactionId: transactionId.toString(),
            riskScore,
        });
        this.realtimeGateway.server?.to(`user:${employeeId}`).emit('notification', notif);
        console.log(`🚨 Created fraud alert notification for employee ${employeeId}`);
    }
};
exports.NotificationsListener = NotificationsListener;
__decorate([
    (0, event_emitter_1.OnEvent)(events_constants_1.TRANSACTION_EVENTS.TRANSFER_COMPLETED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsListener.prototype, "handleTransferCompleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)(events_constants_1.TRANSACTION_EVENTS.FRAUD_DETECTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsListener.prototype, "handleFraudDetected", null);
exports.NotificationsListener = NotificationsListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        realtime_gateway_1.RealtimeGateway])
], NotificationsListener);
//# sourceMappingURL=notifications.listener.js.map