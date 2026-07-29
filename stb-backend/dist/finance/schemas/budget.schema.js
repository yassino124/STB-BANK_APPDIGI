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
exports.BudgetSchema = exports.Budget = exports.BudgetStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var BudgetStatus;
(function (BudgetStatus) {
    BudgetStatus["DRAFT"] = "DRAFT";
    BudgetStatus["APPROVED"] = "APPROVED";
    BudgetStatus["ACTIVE"] = "ACTIVE";
    BudgetStatus["COMPLETED"] = "COMPLETED";
    BudgetStatus["CANCELLED"] = "CANCELLED";
})(BudgetStatus || (exports.BudgetStatus = BudgetStatus = {}));
let Budget = class Budget extends mongoose_2.Document {
    name;
    department;
    amount;
    spent;
    savings;
    status;
    createdBy;
    approvedBy;
    approvedAt;
    commentaire;
    metadata;
};
exports.Budget = Budget;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Budget.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Budget.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], Budget.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Budget.prototype, "spent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Budget.prototype, "savings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: BudgetStatus, default: BudgetStatus.DRAFT }),
    __metadata("design:type", String)
], Budget.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Budget.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Budget.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Budget.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Budget.prototype, "commentaire", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Budget.prototype, "metadata", void 0);
exports.Budget = Budget = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Budget);
exports.BudgetSchema = mongoose_1.SchemaFactory.createForClass(Budget);
exports.BudgetSchema.index({ department: 1, status: 1 });
//# sourceMappingURL=budget.schema.js.map