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
exports.TicketMessageSchema = exports.TicketMessage = exports.MessageSender = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var MessageSender;
(function (MessageSender) {
    MessageSender["EMPLOYEE"] = "EMPLOYEE";
    MessageSender["RH"] = "RH";
    MessageSender["SYSTEM"] = "SYSTEM";
})(MessageSender || (exports.MessageSender = MessageSender = {}));
let TicketMessage = class TicketMessage {
    ticketId;
    senderId;
    senderType;
    message;
    attachments;
    isRead;
    readAt;
};
exports.TicketMessage = TicketMessage;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Ticket', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TicketMessage.prototype, "ticketId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TicketMessage.prototype, "senderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: MessageSender }),
    __metadata("design:type", String)
], TicketMessage.prototype, "senderType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TicketMessage.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TicketMessage.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], TicketMessage.prototype, "isRead", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], TicketMessage.prototype, "readAt", void 0);
exports.TicketMessage = TicketMessage = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'ticket_messages' })
], TicketMessage);
exports.TicketMessageSchema = mongoose_1.SchemaFactory.createForClass(TicketMessage);
exports.TicketMessageSchema.index({ ticketId: 1, createdAt: 1 });
exports.TicketMessageSchema.index({ senderId: 1 });
//# sourceMappingURL=ticket-message.schema.js.map