import { Model, Types } from 'mongoose';
import { ChequeRequest } from './cheques.schema';
import { CreateChequeRequestDto } from './dto/cheques.dto';
export declare class ChequesService {
    private model;
    constructor(model: Model<ChequeRequest>);
    create(employeeId: string, dto: CreateChequeRequestDto): Promise<import("mongoose").Document<unknown, {}, ChequeRequest, {}, import("mongoose").DefaultSchemaOptions> & ChequeRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, ChequeRequest, {}, import("mongoose").DefaultSchemaOptions> & ChequeRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, ChequeRequest, {}, import("mongoose").DefaultSchemaOptions> & ChequeRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    updateStatus(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, ChequeRequest, {}, import("mongoose").DefaultSchemaOptions> & ChequeRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
