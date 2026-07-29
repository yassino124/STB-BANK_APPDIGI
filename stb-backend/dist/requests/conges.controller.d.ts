import { CongesService } from './conges.service';
import { CongeType } from './schemas/conge.schema';
export declare class CongesController {
    private readonly congesService;
    constructor(congesService: CongesService);
    createConge(req: any, body: {
        type: CongeType;
        startDate: string;
        endDate: string;
        motif?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("./schemas/conge.schema").Conge;
    }>;
    getMyConges(req: any): Promise<{
        success: boolean;
        data: import("./schemas/conge.schema").Conge[];
    }>;
    getAllConges(statut?: string, employeeId?: string): Promise<{
        success: boolean;
        data: import("./schemas/conge.schema").Conge[];
    }>;
    getTeamCalendar(req: any, month: string, year: string): Promise<{
        success: boolean;
        data: import("./schemas/conge.schema").Conge[];
    }>;
    approveConge(req: any, congeId: string, body: {
        role: 'MANAGER' | 'RH' | 'DG';
    }): Promise<{
        success: boolean;
        message: string;
        data: import("./schemas/conge.schema").Conge;
    }>;
    refuseConge(req: any, congeId: string, body: {
        reason: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("./schemas/conge.schema").Conge;
    }>;
    updateStatut(req: any, congeId: string, body: {
        statut: string;
        rejectionReason?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("./schemas/conge.schema").Conge;
    }>;
    uploadJustificatif(congeId: string, file: any): Promise<{
        success: boolean;
        message: string;
        data: import("./schemas/conge.schema").Conge;
    }>;
    getCongesStats(): Promise<{
        success: boolean;
        data: {
            totalEnAttente: number;
            totalApprouve: number;
            totalRefuse: number;
        };
    }>;
}
