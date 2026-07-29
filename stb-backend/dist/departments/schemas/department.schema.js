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
exports.DepartmentSchema = exports.Department = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Department = class Department {
    name;
    code;
    description;
    managerId;
    parentDepartmentId;
    isActive;
    employeeCount;
    metadata;
};
exports.Department = Department;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true }),
    __metadata("design:type", String)
], Department.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true, uppercase: true }),
    __metadata("design:type", String)
], Department.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Department.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", Object)
], Department.prototype, "managerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Department', default: null }),
    __metadata("design:type", Object)
], Department.prototype, "parentDepartmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Department.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Department.prototype, "employeeCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Department.prototype, "metadata", void 0);
exports.Department = Department = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'departments' })
], Department);
exports.DepartmentSchema = mongoose_1.SchemaFactory.createForClass(Department);
exports.DepartmentSchema.index({ parentDepartmentId: 1 });
//# sourceMappingURL=department.schema.js.map