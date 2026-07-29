import { HierarchyService } from './hierarchy.service';
export declare class HierarchyController {
    private readonly hierarchyService;
    constructor(hierarchyService: HierarchyService);
    buildForEmployee(employeeId: string): Promise<import("./hierarchy.schema").HierarchyDocument>;
    rebuildAll(): Promise<void>;
    getChain(employeeId: string): Promise<import("./hierarchy.schema").HierarchyDocument[]>;
    getDirectReports(managerId: string): Promise<import("./hierarchy.schema").HierarchyDocument[]>;
    getPendingApprovals(req: any): Promise<import("../leave/schemas/leave.schema").LeaveRequestDocument[]>;
    validateApproval(leaveRequestId: string, req: any): Promise<{
        canApprove: boolean;
        reason?: string;
        isN2?: boolean;
    }>;
    getMyInfo(req: any): Promise<import("./hierarchy.schema").HierarchyDocument[]>;
}
