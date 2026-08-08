import { PrimesService } from './primes.service';
export declare class PrimesController {
    private readonly primesService;
    constructor(primesService: PrimesService);
    create(req: any, dto: {
        type: string;
        montant: number;
        description: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/prime.schema").Prime, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/prime.schema").Prime & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    adminCreate(req: any, dto: {
        employeeId: string;
        type: string;
        montant: number;
        description: string;
    }): Promise<{
        success: boolean;
        prime: import("mongoose").Document<unknown, {}, import("./schemas/prime.schema").Prime, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/prime.schema").Prime & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
        credited: boolean;
        message: string;
    }>;
    distribute(req: any, dto: {
        type: string;
        montant: number;
        description: string;
    }): Promise<{
        success: boolean;
        total: number;
        credited: number;
        errors: number;
        montantTotal: number;
        results: any[];
    }>;
    getMine(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/prime.schema").Prime, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/prime.schema").Prime & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/prime.schema").Prime, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/prime.schema").Prime & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPending(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/prime.schema").Prime, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/prime.schema").Prime & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    handle(id: string, req: any, body: {
        decision: 'APPROVED' | 'REJECTED';
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/prime.schema").Prime, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/prime.schema").Prime & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
