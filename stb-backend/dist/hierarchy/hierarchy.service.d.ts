import { Model } from 'mongoose';
import { HierarchyDocument } from './hierarchy.schema';
import { EmployeeDocument } from '../employees/employee.schema';
import { LeaveRequestDocument } from '../leave/schemas/leave.schema';
export declare class HierarchyService {
    private hierarchyModel;
    private employeeModel;
    private leaveRequestModel;
    constructor(hierarchyModel: Model<HierarchyDocument>, employeeModel: Model<EmployeeDocument>, leaveRequestModel: Model<LeaveRequestDocument>);
    buildForEmployee(employeeId: string): Promise<HierarchyDocument>;
    rebuildAll(): Promise<void>;
    getChain(employeeId: string): Promise<HierarchyDocument[]>;
    getDirectReports(managerId: string): Promise<HierarchyDocument[]>;
    getPendingApprovals(managerId: string): Promise<LeaveRequestDocument[]>;
    validateApproval(leaveRequestId: string, approverId: string): Promise<{
        canApprove: boolean;
        reason?: string;
        isN2?: boolean;
    }>;
    isManager(employeeId: string): Promise<boolean>;
    private _rebuildChain;
}
