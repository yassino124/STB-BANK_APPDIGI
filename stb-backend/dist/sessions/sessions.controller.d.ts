import { SessionsService } from './sessions.service';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    getMySessions(employeeId: string): Promise<import("./session.schema").SessionDocument[]>;
    revokeSession(employeeId: string, sessionId: string): Promise<{
        message: string;
    }>;
    revokeAllSessions(employeeId: string, authHeader: string): Promise<{
        message: string;
        count: number;
    }>;
}
