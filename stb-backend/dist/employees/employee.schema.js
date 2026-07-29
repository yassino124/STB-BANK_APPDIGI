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
exports.EmployeeSchema = exports.Employee = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_enum_1 = require("../common/enums/role.enum");
const employee_status_enum_1 = require("../common/enums/employee-status.enum");
let Employee = class Employee {
    matricule;
    cin;
    dateNaissance;
    nom;
    prenom;
    email;
    phone;
    passwordHash;
    pinHash;
    roles;
    status;
    faceEnabled;
    fingerEnabled;
    isActivated;
    failedLoginAttempts;
    lockedUntil;
    lastLoginAt;
    passwordChangedAt;
    avatar;
    address;
    city;
    country;
    poste;
    departmentId;
    branchId;
    managerId;
    contractType;
    contractStart;
    contractEnd;
    workSchedule;
    shiftPattern;
    emergencyContactName;
    emergencyContactPhone;
    emergencyContactRelationship;
    bankRib;
    bankName;
    soldeConges;
    creditsEnCours;
    avancesEnCours;
    prime;
    salaireBase;
    dateEmbauche;
    compteSolde;
    metadata;
};
exports.Employee = Employee;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true, uppercase: true }),
    __metadata("design:type", String)
], Employee.prototype, "matricule", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true, uppercase: true }),
    __metadata("design:type", String)
], Employee.prototype, "cin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date, index: true }),
    __metadata("design:type", Date)
], Employee.prototype, "dateNaissance", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, index: true }),
    __metadata("design:type", String)
], Employee.prototype, "nom", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, index: true }),
    __metadata("design:type", String)
], Employee.prototype, "prenom", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true, index: true }),
    __metadata("design:type", String)
], Employee.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, trim: true, index: true }),
    __metadata("design:type", String)
], Employee.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, select: false }),
    __metadata("design:type", Object)
], Employee.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, select: false }),
    __metadata("design:type", Object)
], Employee.prototype, "pinHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], enum: role_enum_1.Role, default: [role_enum_1.Role.EMPLOYEE], index: true }),
    __metadata("design:type", Array)
], Employee.prototype, "roles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: employee_status_enum_1.EmployeeStatus, default: employee_status_enum_1.EmployeeStatus.PENDING_ACTIVATION, index: true }),
    __metadata("design:type", String)
], Employee.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "faceEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "fingerEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "isActivated", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "failedLoginAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Employee.prototype, "lockedUntil", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Employee.prototype, "lastLoginAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Employee.prototype, "passwordChangedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true }),
    __metadata("design:type", Object)
], Employee.prototype, "avatar", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true }),
    __metadata("design:type", Object)
], Employee.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true, index: true }),
    __metadata("design:type", Object)
], Employee.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true, index: true }),
    __metadata("design:type", Object)
], Employee.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true }),
    __metadata("design:type", Object)
], Employee.prototype, "poste", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Department', default: null, index: true }),
    __metadata("design:type", Object)
], Employee.prototype, "departmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Branch', default: null, index: true }),
    __metadata("design:type", Object)
], Employee.prototype, "branchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Employee', default: null }),
    __metadata("design:type", Object)
], Employee.prototype, "managerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true }),
    __metadata("design:type", Object)
], Employee.prototype, "contractType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Employee.prototype, "contractStart", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Employee.prototype, "contractEnd", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true }),
    __metadata("design:type", Object)
], Employee.prototype, "workSchedule", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true }),
    __metadata("design:type", Object)
], Employee.prototype, "shiftPattern", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true }),
    __metadata("design:type", Object)
], Employee.prototype, "emergencyContactName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true }),
    __metadata("design:type", Object)
], Employee.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true }),
    __metadata("design:type", Object)
], Employee.prototype, "emergencyContactRelationship", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true }),
    __metadata("design:type", Object)
], Employee.prototype, "bankRib", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null, trim: true }),
    __metadata("design:type", Object)
], Employee.prototype, "bankName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 90, max: 90, min: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "soldeConges", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "creditsEnCours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "avancesEnCours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "prime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 1200 }),
    __metadata("design:type", Number)
], Employee.prototype, "salaireBase", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, index: true }),
    __metadata("design:type", Date)
], Employee.prototype, "dateEmbauche", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "compteSolde", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Employee.prototype, "metadata", void 0);
exports.Employee = Employee = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'employees' })
], Employee);
exports.EmployeeSchema = mongoose_1.SchemaFactory.createForClass(Employee);
exports.EmployeeSchema.index({ matricule: 1, cin: 1 });
exports.EmployeeSchema.index({ status: 1, roles: 1 });
exports.EmployeeSchema.index({ departmentId: 1, status: 1 });
exports.EmployeeSchema.index({ branchId: 1, status: 1 });
exports.EmployeeSchema.index({ managerId: 1 });
exports.EmployeeSchema.index({ createdAt: -1 });
//# sourceMappingURL=employee.schema.js.map