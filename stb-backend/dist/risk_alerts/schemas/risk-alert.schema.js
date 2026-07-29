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
exports.RiskAlertSchema = exports.RiskAlert = exports.AlertStatus = exports.AlertSeverity = exports.AlertType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var AlertType;
(function (AlertType) {
    AlertType["UNUSUAL_TRANSACTION"] = "UNUSUAL_TRANSACTION";
    AlertType["MULTIPLE_LOGINS"] = "MULTIPLE_LOGINS";
    AlertType["LARGE_WITHDRAWAL"] = "LARGE_WITHDRAWAL";
    AlertType["FOREIGN_TRANSACTION"] = "FOREIGN_TRANSACTION";
    AlertType["CREDIT_OVERDUE"] = "CREDIT_OVERDUE";
    AlertType["ACCOUNT_ANOMALY"] = "ACCOUNT_ANOMALY";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["LOW"] = "LOW";
    AlertSeverity["MEDIUM"] = "MEDIUM";
    AlertSeverity["HIGH"] = "HIGH";
    AlertSeverity["CRITICAL"] = "CRITICAL";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["OPEN"] = "OPEN";
    AlertStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    AlertStatus["RESOLVED"] = "RESOLVED";
    AlertStatus["FALSE_POSITIVE"] = "FALSE_POSITIVE";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
let RiskAlert = class RiskAlert {
    employeeId;
    type;
    severity;
    title;
    description;
    data;
    status;
    resolvedBy;
    resolvedAt;
    resolution;
};
exports.RiskAlert = RiskAlert;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RiskAlert.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AlertType, index: true }),
    __metadata("design:type", String)
], RiskAlert.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AlertSeverity, index: true }),
    __metadata("design:type", String)
], RiskAlert.prototype, "severity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], RiskAlert.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], RiskAlert.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], RiskAlert.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AlertStatus, default: AlertStatus.OPEN, index: true }),
    __metadata("design:type", String)
], RiskAlert.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", Object)
], RiskAlert.prototype, "resolvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], RiskAlert.prototype, "resolvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], RiskAlert.prototype, "resolution", void 0);
exports.RiskAlert = RiskAlert = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'risk_alerts' })
], RiskAlert);
exports.RiskAlertSchema = mongoose_1.SchemaFactory.createForClass(RiskAlert);
exports.RiskAlertSchema.index({ employeeId: 1, status: 1, createdAt: -1 });
exports.RiskAlertSchema.index({ severity: 1, status: 1 });
//# sourceMappingURL=risk-alert.schema.js.map