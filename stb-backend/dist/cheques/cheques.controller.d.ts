import { ChequesService } from './cheques.service';
import { CreateChequeRequestDto, UpdateChequeStatusDto } from './dto/cheques.dto';
export declare class ChequesController {
    private readonly service;
    constructor(service: ChequesService);
    createMyRequest(req: any, dto: CreateChequeRequestDto): Promise<import("mongoose").Document<unknown, {}, import("./cheques.schema").ChequeRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./cheques.schema").ChequeRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMyRequests(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./cheques.schema").ChequeRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./cheques.schema").ChequeRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./cheques.schema").ChequeRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./cheques.schema").ChequeRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    updateStatus(id: string, dto: UpdateChequeStatusDto): Promise<import("mongoose").Document<unknown, {}, import("./cheques.schema").ChequeRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./cheques.schema").ChequeRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
