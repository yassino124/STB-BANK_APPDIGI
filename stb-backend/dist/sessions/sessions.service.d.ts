import { Model } from 'mongoose';
import { SessionDocument } from './session.schema';
export declare class SessionsService {
    private sessionModel;
    constructor(sessionModel: Model<SessionDocument>);
    getMySessions(employeeId: string): Promise<SessionDocument[]>;
    revokeSession(employeeId: string, sessionId: string): Promise<{
        message: string;
    }>;
    revokeAllSessions(employeeId: string, exceptToken?: string): Promise<{
        message: string;
        count: number;
    }>;
}
