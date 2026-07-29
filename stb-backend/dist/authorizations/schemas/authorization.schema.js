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
exports.AuthorizationSchema = exports.Authorization = exports.AuthorizationPriority = exports.AuthorizationStatus = exports.AuthorizationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var AuthorizationType;
(function (AuthorizationType) {
    AuthorizationType["SORTIE"] = "SORTIE";
    AuthorizationType["MISSION"] = "MISSION";
    AuthorizationType["TELETRAVAIL"] = "TELETRAVAIL";
    AuthorizationType["RETARD"] = "RETARD";
    AuthorizationType["HEURES_SUP"] = "HEURES_SUP";
    AuthorizationType["CONGE"] = "CONGE";
    AuthorizationType["FORMATION"] = "FORMATION";
    AuthorizationType["DELEGATION"] = "DELEGATION";
})(AuthorizationType || (exports.AuthorizationType = AuthorizationType = {}));
var AuthorizationStatus;
(function (AuthorizationStatus) {
    AuthorizationStatus["PENDING"] = "PENDING";
    AuthorizationStatus["APPROVED"] = "APPROVED";
    AuthorizationStatus["REJECTED"] = "REJECTED";
    AuthorizationStatus["CANCELLED"] = "CANCELLED";
    AuthorizationStatus["EXPIRED"] = "EXPIRED";
})(AuthorizationStatus || (exports.AuthorizationStatus = AuthorizationStatus = {}));
var AuthorizationPriority;
(function (AuthorizationPriority) {
    AuthorizationPriority["LOW"] = "LOW";
    AuthorizationPriority["NORMAL"] = "NORMAL";
    AuthorizationPriority["HIGH"] = "HIGH";
    AuthorizationPriority["URGENT"] = "URGENT";
})(AuthorizationPriority || (exports.AuthorizationPriority = AuthorizationPriority = {}));
let Authorization = class Authorization extends mongoose_2.Document {
    employeeId;
    type;
    date;
    heureDebut;
    heureFin;
    motif;
    status;
    approvedBy;
    commentaire;
    approverId;
    approvedAt;
    rejectionReason;
    priority;
    metadata;
};
exports.Authorization = Authorization;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Authorization.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: AuthorizationType, required: true, index: true }),
    __metadata("design:type", String)
], Authorization.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Authorization.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Authorization.prototype, "heureDebut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Authorization.prototype, "heureFin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Authorization.prototype, "motif", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: AuthorizationStatus, default: AuthorizationStatus.PENDING, index: true }),
    __metadata("design:type", String)
], Authorization.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Authorization.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Authorization.prototype, "commentaire", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null, index: true }),
    __metadata("design:type", Object)
], Authorization.prototype, "approverId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Authorization.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Authorization.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: AuthorizationPriority, default: AuthorizationPriority.NORMAL, index: true }),
    __metadata("design:type", String)
], Authorization.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Authorization.prototype, "metadata", void 0);
exports.Authorization = Authorization = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Authorization);
exports.AuthorizationSchema = mongoose_1.SchemaFactory.createForClass(Authorization);
exports.AuthorizationSchema.index({ employeeId: 1, status: 1 });
exports.AuthorizationSchema.index({ approverId: 1, status: 1 });
exports.AuthorizationSchema.index({ type: 1, status: 1 });
//# sourceMappingURL=authorization.schema.js.map