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
exports.TicketSchema = exports.Ticket = exports.TicketPriority = exports.TicketStatus = exports.TicketType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TicketType;
(function (TicketType) {
    TicketType["ASSISTANCE"] = "ASSISTANCE";
    TicketType["RECLAMATION"] = "RECLAMATION";
    TicketType["BUG"] = "BUG";
    TicketType["FEEDBACK"] = "FEEDBACK";
})(TicketType || (exports.TicketType = TicketType = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "OPEN";
    TicketStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TicketStatus["WAITING_RESPONSE"] = "WAITING_RESPONSE";
    TicketStatus["RESOLVED"] = "RESOLVED";
    TicketStatus["CLOSED"] = "CLOSED";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var TicketPriority;
(function (TicketPriority) {
    TicketPriority["LOW"] = "LOW";
    TicketPriority["MEDIUM"] = "MEDIUM";
    TicketPriority["HIGH"] = "HIGH";
    TicketPriority["URGENT"] = "URGENT";
})(TicketPriority || (exports.TicketPriority = TicketPriority = {}));
let Ticket = class Ticket {
    employeeId;
    subject;
    message;
    type;
    status;
    priority;
    assignedTo;
    resolvedAt;
    closedAt;
    messageCount;
    lastMessageAt;
};
exports.Ticket = Ticket;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Ticket.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Ticket.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Ticket.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: TicketType, default: TicketType.ASSISTANCE }),
    __metadata("design:type", String)
], Ticket.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: TicketStatus, default: TicketStatus.OPEN, index: true }),
    __metadata("design:type", String)
], Ticket.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: TicketPriority, default: TicketPriority.MEDIUM }),
    __metadata("design:type", String)
], Ticket.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", Object)
], Ticket.prototype, "assignedTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Ticket.prototype, "resolvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Ticket.prototype, "closedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Ticket.prototype, "messageCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], Ticket.prototype, "lastMessageAt", void 0);
exports.Ticket = Ticket = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'tickets' })
], Ticket);
exports.TicketSchema = mongoose_1.SchemaFactory.createForClass(Ticket);
exports.TicketSchema.index({ employeeId: 1, status: 1 });
exports.TicketSchema.index({ assignedTo: 1, status: 1 });
exports.TicketSchema.index({ createdAt: -1 });
exports.TicketSchema.index({ lastMessageAt: -1 });
//# sourceMappingURL=ticket.schema.js.map