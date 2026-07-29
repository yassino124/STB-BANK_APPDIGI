import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hierarchy, HierarchyDocument } from './hierarchy.schema';
import { Employee, EmployeeDocument } from '../employees/employee.schema';
import { LeaveRequest, LeaveRequestDocument } from '../leave/schemas/leave.schema';
import { Role } from '../common/enums/role.enum';
import { LeaveStatus } from '../leave/schemas/leave.schema';

@Injectable()
export class HierarchyService {
  constructor(
    @InjectModel(Hierarchy.name)
    private hierarchyModel: Model<HierarchyDocument>,
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequestDocument>,
  ) {}

  async buildForEmployee(employeeId: string): Promise<HierarchyDocument> {
    const employee = await this.employeeModel.findById(employeeId).exec();
    if (!employee) throw new NotFoundException('Employé introuvable');

    let existing = await this.hierarchyModel.findOne({ employeeId: new Types.ObjectId(employeeId) }).exec();

    if (!existing) {
      existing = await this.hierarchyModel.create({
        employeeId: new Types.ObjectId(employeeId),
        managerId: employee.managerId,
        level: 1,
        isManager: employee.roles.includes(Role.MANAGER),
        directReports: [],
      });
    } else {
      existing.managerId = employee.managerId;
      existing.isManager = employee.roles.includes(Role.MANAGER);
      await existing.save();
    }

    await this._rebuildChain(employeeId);
    return existing;
  }

  async rebuildAll(): Promise<void> {
    const employees = await this.employeeModel.find({}).select('_id managerId roles').exec();
    for (const emp of employees) {
      await this.buildForEmployee(emp._id.toString());
    }
  }

  async getChain(employeeId: string): Promise<HierarchyDocument[]> {
    const chain: HierarchyDocument[] = [];
    let current = await this.hierarchyModel.findOne({ employeeId: new Types.ObjectId(employeeId) }).exec();

    while (current) {
      chain.push(current);
      if (!current.managerId) break;
      current = await this.hierarchyModel.findOne({ employeeId: current.managerId }).exec();
    }

    return chain;
  }

  async getDirectReports(managerId: string): Promise<HierarchyDocument[]> {
    return this.hierarchyModel.find({ managerId: new Types.ObjectId(managerId) }).exec();
  }

  async getPendingApprovals(managerId: string): Promise<LeaveRequestDocument[]> {
    return this.leaveRequestModel
      .find({
        managerId: new Types.ObjectId(managerId),
        status: LeaveStatus.PENDING_N1,
      })
      .populate('employeeId', 'nom prenom matricule poste soldeConges')
      .sort({ createdAt: -1 })
      .exec();
  }

  async validateApproval(leaveRequestId: string, approverId: string): Promise<{ canApprove: boolean; reason?: string; isN2?: boolean }> {
    const leaveReq = await this.leaveRequestModel.findById(leaveRequestId).exec();
    if (!leaveReq) throw new NotFoundException('Demande de congé introuvable');

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

  async isManager(employeeId: string): Promise<boolean> {
    const hierarchy = await this.hierarchyModel.findOne({ employeeId: new Types.ObjectId(employeeId) }).exec();
    return hierarchy?.isManager ?? false;
  }

  private async _rebuildChain(employeeId: string): Promise<void> {
    const employee = await this.employeeModel.findById(employeeId).exec();
    if (!employee || !employee.managerId) return;

    const managerHierarchy = await this.hierarchyModel.findOne({ employeeId: employee.managerId }).exec();
    const currentHierarchy = await this.hierarchyModel.findOne({ employeeId: new Types.ObjectId(employeeId) }).exec();

    if (!currentHierarchy) return;

    const managerLevel = managerHierarchy ? managerHierarchy.level : 0;
    currentHierarchy.level = managerLevel + 1;

    if (managerHierarchy && managerHierarchy.directReports) {
      const exists = managerHierarchy.directReports.some(
        (dr) => dr.toString() === employeeId,
      );
      if (!exists) {
        managerHierarchy.directReports.push(new Types.ObjectId(employeeId));
        await managerHierarchy.save();
      }
    }

    await currentHierarchy.save();
  }
}