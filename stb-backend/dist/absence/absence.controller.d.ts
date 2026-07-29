import { AbsenceService } from './absence.service';
export declare class AbsenceController {
    private readonly absenceService;
    constructor(absenceService: AbsenceService);
    create(req: any, dto: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/absence.schema").AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/absence.schema").Absence & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMine(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/absence.schema").AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/absence.schema").Absence & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPendingForManager(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/absence.schema").AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/absence.schema").Absence & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPendingRh(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/absence.schema").AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/absence.schema").Absence & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAll(status?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/absence.schema").AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/absence.schema").Absence & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    handleManagerApproval(id: string, req: any, body: {
        decision: 'APPROVED' | 'REJECTED';
        commentaire?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/absence.schema").AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/absence.schema").Absence & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    handleRhApproval(id: string, req: any, body: {
        decision: 'APPROVED' | 'REJECTED';
        commentaire?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/absence.schema").AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/absence.schema").Absence & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    cancel(id: string, req: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/absence.schema").AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/absence.schema").Absence & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
