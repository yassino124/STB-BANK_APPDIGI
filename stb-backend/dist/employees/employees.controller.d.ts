import { EmployeesService } from './employees.service';
import { ActivityLogsService } from '../activity_logs/activity-logs.service';
import { CreateEmployeeDto, UpdateEmployeeRolesDto, UpdateEmployeeStatusDto, UpdateEmployeeFinancialsDto, UpdateEmployeeAvatarDto } from './dto/employee.dto';
export declare class EmployeesController {
    private readonly employeesService;
    private readonly activityLogsService;
    constructor(employeesService: EmployeesService, activityLogsService: ActivityLogsService);
    create(dto: CreateEmployeeDto): Promise<{
        employee: import("mongoose").Document<unknown, {}, import("./employee.schema").EmployeeDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./employee.schema").Employee & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
        defaultPassword: string;
        matricule: string;
    }>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        data: import("./employee.schema").EmployeeDocument[];
        total: number;
        page: number;
        pages: number;
    }>;
    searchDirectory(query: string): Promise<Partial<import("./employee.schema").EmployeeDocument>[]>;
    getStats(): Promise<Record<string, number>>;
    getMyActivityTimeline(req: any, limit?: number): Promise<any[]>;
    getAvatar(id: string, req: any): Promise<Buffer<ArrayBuffer>>;
    getFinanceProfile(id: string): Promise<any>;
    findOne(id: string): Promise<import("./employee.schema").EmployeeDocument>;
    updateRoles(id: string, dto: UpdateEmployeeRolesDto): Promise<import("./employee.schema").EmployeeDocument>;
    updateStatus(id: string, dto: UpdateEmployeeStatusDto): Promise<import("./employee.schema").EmployeeDocument>;
    updateFinancials(id: string, dto: UpdateEmployeeFinancialsDto): Promise<import("mongoose").Document<unknown, {}, import("./employee.schema").EmployeeDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./employee.schema").Employee & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateAvatar(id: string, dto: UpdateEmployeeAvatarDto): Promise<{
        success: boolean;
        message: string;
        data: {
            avatar: string | null;
        };
    }>;
}
