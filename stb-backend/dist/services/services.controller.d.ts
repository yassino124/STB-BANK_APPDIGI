import { ServicesService } from './services.service';
import { Service } from './schemas/service.schema';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    create(data: Partial<Service>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/service.schema").ServiceDocument, {}, import("mongoose").DefaultSchemaOptions> & Service & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/service.schema").ServiceDocument, {}, import("mongoose").DefaultSchemaOptions> & Service & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/service.schema").ServiceDocument, {}, import("mongoose").DefaultSchemaOptions> & Service & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<Service>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/service.schema").ServiceDocument, {}, import("mongoose").DefaultSchemaOptions> & Service & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
