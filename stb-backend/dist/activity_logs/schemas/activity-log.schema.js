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
exports.ActivityLogSchema = exports.ActivityLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ActivityLog = class ActivityLog {
    employeeId;
    action;
    module;
    resource;
    resourceId;
    changes;
    ip;
    userAgent;
    deviceInfo;
    success;
    metadata;
};
exports.ActivityLog = ActivityLog;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ActivityLog.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "module", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, index: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "resource", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "resourceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ActivityLog.prototype, "changes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "ip", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "userAgent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ActivityLog.prototype, "deviceInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], ActivityLog.prototype, "success", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ActivityLog.prototype, "metadata", void 0);
exports.ActivityLog = ActivityLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'activity_logs' })
], ActivityLog);
exports.ActivityLogSchema = mongoose_1.SchemaFactory.createForClass(ActivityLog);
exports.ActivityLogSchema.index({ employeeId: 1, createdAt: -1 });
exports.ActivityLogSchema.index({ module: 1, action: 1 });
exports.ActivityLogSchema.index({ createdAt: -1 });
//# sourceMappingURL=activity-log.schema.js.map