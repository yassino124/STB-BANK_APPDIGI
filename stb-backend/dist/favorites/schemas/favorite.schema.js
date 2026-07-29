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
exports.FavoriteSchema = exports.Favorite = exports.FavoriteType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var FavoriteType;
(function (FavoriteType) {
    FavoriteType["TRANSFER"] = "TRANSFER";
    FavoriteType["BILL"] = "BILL";
    FavoriteType["RECHARGE"] = "RECHARGE";
    FavoriteType["SERVICE"] = "SERVICE";
})(FavoriteType || (exports.FavoriteType = FavoriteType = {}));
let Favorite = class Favorite {
    employeeId;
    type;
    referenceId;
    referenceData;
    label;
};
exports.Favorite = Favorite;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Favorite.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: FavoriteType, index: true }),
    __metadata("design:type", String)
], Favorite.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Favorite.prototype, "referenceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Favorite.prototype, "referenceData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Favorite.prototype, "label", void 0);
exports.Favorite = Favorite = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'favorites' })
], Favorite);
exports.FavoriteSchema = mongoose_1.SchemaFactory.createForClass(Favorite);
exports.FavoriteSchema.index({ employeeId: 1, type: 1 });
exports.FavoriteSchema.index({ employeeId: 1, referenceId: 1 }, { unique: true });
//# sourceMappingURL=favorite.schema.js.map