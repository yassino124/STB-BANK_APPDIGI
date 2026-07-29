import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/create-request.dto';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    create(req: any, createRequestDto: CreateRequestDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/request.schema").Request, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/request.schema").Request & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findMine(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/request.schema").Request, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/request.schema").Request & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/request.schema").Request, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/request.schema").Request & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    updateStatus(id: string, updateDto: UpdateRequestStatusDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/request.schema").Request, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/request.schema").Request & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
