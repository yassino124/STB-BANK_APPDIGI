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
exports.OtpSchema = exports.Otp = exports.OtpPurpose = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var OtpPurpose;
(function (OtpPurpose) {
    OtpPurpose["ACTIVATION"] = "ACTIVATION";
    OtpPurpose["PASSWORD_RESET"] = "PASSWORD_RESET";
    OtpPurpose["DEVICE_CHANGE"] = "DEVICE_CHANGE";
    OtpPurpose["EMAIL_VERIFICATION"] = "EMAIL_VERIFICATION";
})(OtpPurpose || (exports.OtpPurpose = OtpPurpose = {}));
let Otp = class Otp {
    employeeId;
    codeHash;
    purpose;
    expiresAt;
    used;
    attempts;
    sentToEmail;
    sentToPhone;
};
exports.Otp = Otp;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Otp.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], Otp.prototype, "codeHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: OtpPurpose, required: true }),
    __metadata("design:type", String)
], Otp.prototype, "purpose", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Otp.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Otp.prototype, "used", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Otp.prototype, "attempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Otp.prototype, "sentToEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Otp.prototype, "sentToPhone", void 0);
exports.Otp = Otp = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'otps' })
], Otp);
exports.OtpSchema = mongoose_1.SchemaFactory.createForClass(Otp);
exports.OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.OtpSchema.index({ employeeId: 1, purpose: 1, used: 1 });
//# sourceMappingURL=otp.schema.js.map