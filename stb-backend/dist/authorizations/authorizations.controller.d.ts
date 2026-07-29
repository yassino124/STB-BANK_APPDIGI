import { AuthorizationsService } from './authorizations.service';
export declare class AuthorizationsController {
    private readonly authorizationsService;
    constructor(authorizationsService: AuthorizationsService);
    create(req: any, dto: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/authorization.schema").Authorization, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/authorization.schema").Authorization & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMine(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/authorization.schema").Authorization, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/authorization.schema").Authorization & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/authorization.schema").Authorization, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/authorization.schema").Authorization & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPending(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/authorization.schema").Authorization, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/authorization.schema").Authorization & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    handle(id: string, req: any, body: {
        decision: 'APPROVED' | 'REJECTED';
        commentaire?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/authorization.schema").Authorization, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/authorization.schema").Authorization & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
