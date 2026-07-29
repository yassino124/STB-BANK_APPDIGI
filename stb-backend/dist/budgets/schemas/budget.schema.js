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
exports.BudgetSchema = exports.Budget = exports.BudgetType = exports.BudgetPeriod = exports.BudgetCategory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var BudgetCategory;
(function (BudgetCategory) {
    BudgetCategory["FOOD"] = "FOOD";
    BudgetCategory["TRANSPORT"] = "TRANSPORT";
    BudgetCategory["ENTERTAINMENT"] = "ENTERTAINMENT";
    BudgetCategory["SHOPPING"] = "SHOPPING";
    BudgetCategory["BILLS"] = "BILLS";
    BudgetCategory["HEALTH"] = "HEALTH";
    BudgetCategory["EDUCATION"] = "EDUCATION";
    BudgetCategory["SAVINGS"] = "SAVINGS";
    BudgetCategory["TRAVEL"] = "TRAVEL";
    BudgetCategory["EMERGENCY"] = "EMERGENCY";
    BudgetCategory["OTHER"] = "OTHER";
})(BudgetCategory || (exports.BudgetCategory = BudgetCategory = {}));
var BudgetPeriod;
(function (BudgetPeriod) {
    BudgetPeriod["WEEKLY"] = "WEEKLY";
    BudgetPeriod["MONTHLY"] = "MONTHLY";
    BudgetPeriod["YEARLY"] = "YEARLY";
})(BudgetPeriod || (exports.BudgetPeriod = BudgetPeriod = {}));
var BudgetType;
(function (BudgetType) {
    BudgetType["SPENDING"] = "SPENDING";
    BudgetType["SAVINGS_GOAL"] = "SAVINGS_GOAL";
})(BudgetType || (exports.BudgetType = BudgetType = {}));
let Budget = class Budget {
    employeeId;
    name;
    category;
    type;
    amount;
    period;
    startDate;
    endDate;
    spent;
    saved;
    currency;
    isActive;
    alertThreshold;
    notificationSent;
    targetDate;
    description;
};
exports.Budget = Budget;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Budget.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Budget.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: BudgetCategory, index: true }),
    __metadata("design:type", String)
], Budget.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: BudgetType, default: BudgetType.SPENDING, index: true }),
    __metadata("design:type", String)
], Budget.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Budget.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: BudgetPeriod, index: true }),
    __metadata("design:type", String)
], Budget.prototype, "period", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", Date)
], Budget.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", Date)
], Budget.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Budget.prototype, "spent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Budget.prototype, "saved", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'TND', uppercase: true }),
    __metadata("design:type", String)
], Budget.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Budget.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 80, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Budget.prototype, "alertThreshold", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Budget.prototype, "notificationSent", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Budget.prototype, "targetDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Budget.prototype, "description", void 0);
exports.Budget = Budget = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'budgets' })
], Budget);
exports.BudgetSchema = mongoose_1.SchemaFactory.createForClass(Budget);
exports.BudgetSchema.index({ employeeId: 1, isActive: 1 });
exports.BudgetSchema.index({ employeeId: 1, category: 1, period: 1 });
exports.BudgetSchema.index({ employeeId: 1, type: 1 });
//# sourceMappingURL=budget.schema.js.map