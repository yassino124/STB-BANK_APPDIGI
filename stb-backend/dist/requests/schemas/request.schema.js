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
exports.RequestSchema = exports.Request = exports.RequestStatus = exports.RequestType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var RequestType;
(function (RequestType) {
    RequestType["CONGE"] = "CONGE";
    RequestType["AVANCE"] = "AVANCE";
    RequestType["CREDIT"] = "CREDIT";
    RequestType["PRIME"] = "PRIME";
    RequestType["DOCUMENT"] = "DOCUMENT";
    RequestType["CARTE"] = "CARTE";
})(RequestType || (exports.RequestType = RequestType = {}));
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["EN_ATTENTE"] = "EN_ATTENTE";
    RequestStatus["APPROUVE"] = "APPROUVE";
    RequestStatus["REFUSE"] = "REFUSE";
    RequestStatus["ANNULE"] = "ANNULE";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
let Request = class Request extends mongoose_2.Document {
    type;
    status;
    employeeId;
    payload;
    responseMessage;
};
exports.Request = Request;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: RequestType }),
    __metadata("design:type", String)
], Request.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: RequestStatus, default: RequestStatus.EN_ATTENTE }),
    __metadata("design:type", String)
], Request.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Employee' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Request.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], Request.prototype, "payload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Request.prototype, "responseMessage", void 0);
exports.Request = Request = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Request);
exports.RequestSchema = mongoose_1.SchemaFactory.createForClass(Request);
//# sourceMappingURL=request.schema.js.map