import { AvancesService } from './avances.service';
import { AvanceType, AvanceStatut } from './schemas/avance.schema';
export declare class AvancesController {
    private readonly avancesService;
    constructor(avancesService: AvancesService);
    create(req: any, body: {
        type: AvanceType;
        montant: number;
        motif?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/avance.schema").Avance, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/avance.schema").Avance & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    getMyAvances(req: any): Promise<{
        success: boolean;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/avance.schema").Avance, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/avance.schema").Avance & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    getAllAvances(statut?: AvanceStatut, employeeId?: string): Promise<{
        success: boolean;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/avance.schema").Avance, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/avance.schema").Avance & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    updateStatut(req: any, id: string, body: {
        statut: AvanceStatut;
        rejectionReason?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/avance.schema").Avance, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/avance.schema").Avance & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    delete(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
