import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { EmployeeDocument } from '../employees/employee.schema';
export declare class DepartmentsService {
    private departmentModel;
    private employeeModel;
    constructor(departmentModel: Model<DepartmentDocument>, employeeModel: Model<EmployeeDocument>);
    create(data: Partial<Department>): Promise<import("mongoose").Document<unknown, {}, DepartmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, DepartmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, DepartmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<Department>): Promise<import("mongoose").Document<unknown, {}, DepartmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
    }>;
    updateEmployeeCount(departmentId: string): Promise<void>;
}
