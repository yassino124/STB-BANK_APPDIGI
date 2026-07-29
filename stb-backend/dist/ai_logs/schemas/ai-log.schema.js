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
exports.AiLogSchema = exports.AiLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let AiLog = class AiLog {
    employeeId;
    sessionId;
    prompt;
    response;
    model;
    context;
    tokensUsed;
    latency;
    success;
    error;
    feedback;
    metadata;
};
exports.AiLog = AiLog;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', index: true, default: null }),
    __metadata("design:type", Object)
], AiLog.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], AiLog.prototype, "sessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AiLog.prototype, "prompt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AiLog.prototype, "response", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'gemini-2.0-flash' }),
    __metadata("design:type", String)
], AiLog.prototype, "model", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], AiLog.prototype, "context", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AiLog.prototype, "tokensUsed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AiLog.prototype, "latency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], AiLog.prototype, "success", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], AiLog.prototype, "error", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'], default: 'NEUTRAL' }),
    __metadata("design:type", String)
], AiLog.prototype, "feedback", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], AiLog.prototype, "metadata", void 0);
exports.AiLog = AiLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'ai_logs' })
], AiLog);
exports.AiLogSchema = mongoose_1.SchemaFactory.createForClass(AiLog);
exports.AiLogSchema.index({ employeeId: 1, createdAt: -1 });
exports.AiLogSchema.index({ success: 1, createdAt: -1 });
//# sourceMappingURL=ai-log.schema.js.map