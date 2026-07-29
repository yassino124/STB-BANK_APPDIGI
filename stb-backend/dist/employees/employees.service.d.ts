import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './employee.schema';
import { CreateEmployeeDto, UpdateEmployeeRolesDto, UpdateEmployeeStatusDto } from './dto/employee.dto';
import { AccountsService } from '../accounts/accounts.service';
export declare class EmployeesService {
    private employeeModel;
    private accountsService;
    constructor(employeeModel: Model<EmployeeDocument>, accountsService: AccountsService);
    create(dto: CreateEmployeeDto): Promise<{
        employee: import("mongoose").Document<unknown, {}, EmployeeDocument, {}, import("mongoose").DefaultSchemaOptions> & Employee & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
        data: EmployeeDocument[];
        total: number;
        page: number;
        pages: number;
    }>;
    searchDirectory(search: string): Promise<Partial<EmployeeDocument>[]>;
    findOne(id: string): Promise<EmployeeDocument>;
    findByMatricule(matricule: string): Promise<EmployeeDocument>;
    updateRoles(id: string, dto: UpdateEmployeeRolesDto): Promise<EmployeeDocument>;
    updateStatus(id: string, dto: UpdateEmployeeStatusDto): Promise<EmployeeDocument>;
    getStats(): Promise<Record<string, number>>;
    updateFinancials(id: string, updates: Partial<{
        soldeConges: number;
        creditsEnCours: number;
        avancesEnCours: number;
        prime: number;
        salaireBase: number;
        compteSolde: number;
    }>): Promise<import("mongoose").Document<unknown, {}, EmployeeDocument, {}, import("mongoose").DefaultSchemaOptions> & Employee & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateAvatar(id: string, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            avatar: string | null;
        };
    }>;
    getFinanceProfile(employeeId: string): Promise<any>;
}
