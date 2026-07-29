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
exports.ConversationSchema = exports.Conversation = exports.ConversationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ConversationType;
(function (ConversationType) {
    ConversationType["DIRECT"] = "DIRECT";
    ConversationType["GROUP"] = "GROUP";
    ConversationType["SUPPORT"] = "SUPPORT";
    ConversationType["BROADCAST"] = "BROADCAST";
})(ConversationType || (exports.ConversationType = ConversationType = {}));
let Conversation = class Conversation {
    type;
    participants;
    title;
    description;
    lastMessageAt;
    lastMessagePreview;
    createdBy;
    isActive;
    metadata;
};
exports.Conversation = Conversation;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ConversationType, index: true }),
    __metadata("design:type", String)
], Conversation.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'Employee' }], required: true, index: true }),
    __metadata("design:type", Array)
], Conversation.prototype, "participants", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Conversation.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Conversation.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null, index: true }),
    __metadata("design:type", Object)
], Conversation.prototype, "lastMessageAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Conversation.prototype, "lastMessagePreview", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Conversation.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Conversation.prototype, "metadata", void 0);
exports.Conversation = Conversation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'conversations' })
], Conversation);
exports.ConversationSchema = mongoose_1.SchemaFactory.createForClass(Conversation);
exports.ConversationSchema.index({ participants: 1, lastMessageAt: -1 });
exports.ConversationSchema.index({ type: 1, isActive: 1 });
//# sourceMappingURL=conversation.schema.js.map