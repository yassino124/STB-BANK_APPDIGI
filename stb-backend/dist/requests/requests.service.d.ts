import { Model, Types } from 'mongoose';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/create-request.dto';
import { Request } from './schemas/request.schema';
import { Employee } from '../employees/employee.schema';
import { Transaction } from '../transactions/schemas/transaction.schema';
import { Account } from '../accounts/schemas/account.schema';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
export declare class RequestsService {
    private requestModel;
    private employeeModel;
    private transactionModel;
    private accountModel;
    private readonly realtimeGateway;
    private readonly notificationsService;
    constructor(requestModel: Model<Request>, employeeModel: Model<Employee>, transactionModel: Model<Transaction>, accountModel: Model<Account>, realtimeGateway: RealtimeGateway, notificationsService: NotificationsService);
    create(employeeId: string, createRequestDto: CreateRequestDto): Promise<import("mongoose").Document<unknown, {}, Request, {}, import("mongoose").DefaultSchemaOptions> & Request & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAllByEmployee(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, Request, {}, import("mongoose").DefaultSchemaOptions> & Request & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, Request, {}, import("mongoose").DefaultSchemaOptions> & Request & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    updateStatus(id: string, updateDto: UpdateRequestStatusDto): Promise<import("mongoose").Document<unknown, {}, Request, {}, import("mongoose").DefaultSchemaOptions> & Request & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    private processApproval;
}
