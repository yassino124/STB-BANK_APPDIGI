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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchyService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const hierarchy_schema_1 = require("./hierarchy.schema");
const employee_schema_1 = require("../employees/employee.schema");
const leave_schema_1 = require("../leave/schemas/leave.schema");
const role_enum_1 = require("../common/enums/role.enum");
const leave_schema_2 = require("../leave/schemas/leave.schema");
let HierarchyService = class HierarchyService {
    hierarchyModel;
    employeeModel;
    leaveRequestModel;
    constructor(hierarchyModel, employeeModel, leaveRequestModel) {
        this.hierarchyModel = hierarchyModel;
        this.employeeModel = employeeModel;
        this.leaveRequestModel = leaveRequestModel;
    }
    async buildForEmployee(employeeId) {
        const employee = await this.employeeModel.findById(employeeId).exec();
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable');
        let existing = await this.hierarchyModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).exec();
        if (!existing) {
            existing = await this.hierarchyModel.create({
                employeeId: new mongoose_2.Types.ObjectId(employeeId),
                managerId: employee.managerId,
                level: 1,
                isManager: employee.roles.includes(role_enum_1.Role.MANAGER),
                directReports: [],
            });
        }
        else {
            existing.managerId = employee.managerId;
            existing.isManager = employee.roles.includes(role_enum_1.Role.MANAGER);
            await existing.save();
        }
        await this._rebuildChain(employeeId);
        return existing;
    }
    async rebuildAll() {
        const employees = await this.employeeModel.find({}).select('_id managerId roles').exec();
        for (const emp of employees) {
            await this.buildForEmployee(emp._id.toString());
        }
    }
    async getChain(employeeId) {
        const chain = [];
        let current = await this.hierarchyModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).exec();
        while (current) {
            chain.push(current);
            if (!current.managerId)
                break;
            current = await this.hierarchyModel.findOne({ employeeId: current.managerId }).exec();
        }
        return chain;
    }
    async getDirectReports(managerId) {
        return this.hierarchyModel.find({ managerId: new mongoose_2.Types.ObjectId(managerId) }).exec();
    }
    async getPendingApprovals(managerId) {
        return this.leaveRequestModel
            .find({
            currentApproverId: new mongoose_2.Types.ObjectId(managerId),
            status: leave_schema_2.LeaveStatus.PENDING_MANAGER,
        })
            .populate('employeeId', 'nom prenom matricule poste soldeConges')
            .sort({ createdAt: -1 })
            .exec();
    }
    async validateApproval(leaveRequestId, approverId) {
        const leaveReq = await this.leaveRequestModel.findById(leaveRequestId).exec();
        if (!leaveReq)
            throw new common_1.NotFoundException('Demande de congé introuvable');
        if (!leaveReq.managerId) {
            return { canApprove: false, reason: 'Aucun manager assigné à cette demande' };
        }
        const isDirectN1 = leaveReq.managerId.toString() === approverId;
        if (isDirectN1) {
            return { canApprove: true, isN2: false };
        }
        const chain = await this.getChain(leaveReq.employeeId.toString());
        const n1NodeId = chain.find((h) => h.managerId?.toString() === approverId);
        if (n1NodeId) {
            return { canApprove: true, isN2: true };
        }
        return { canApprove: false, reason: 'Vous ne faites pas partie de la chaîne hiérarchique de cet employé' };
    }
    async isManager(employeeId) {
        const hierarchy = await this.hierarchyModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).exec();
        return hierarchy?.isManager ?? false;
    }
    async _rebuildChain(employeeId) {
        const employee = await this.employeeModel.findById(employeeId).exec();
        if (!employee || !employee.managerId)
            return;
        const managerHierarchy = await this.hierarchyModel.findOne({ employeeId: employee.managerId }).exec();
        const currentHierarchy = await this.hierarchyModel.findOne({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).exec();
        if (!currentHierarchy)
            return;
        const managerLevel = managerHierarchy ? managerHierarchy.level : 0;
        currentHierarchy.level = managerLevel + 1;
        if (managerHierarchy && managerHierarchy.directReports) {
            const exists = managerHierarchy.directReports.some((dr) => dr.toString() === employeeId);
            if (!exists) {
                managerHierarchy.directReports.push(new mongoose_2.Types.ObjectId(employeeId));
                await managerHierarchy.save();
            }
        }
        await currentHierarchy.save();
    }
};
exports.HierarchyService = HierarchyService;
exports.HierarchyService = HierarchyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(hierarchy_schema_1.Hierarchy.name)),
    __param(1, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(2, (0, mongoose_1.InjectModel)(leave_schema_1.LeaveRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], HierarchyService);
//# sourceMappingURL=hierarchy.service.js.map