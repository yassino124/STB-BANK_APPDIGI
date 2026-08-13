import { CopilotService } from './copilot.service';
import { EmployeesService } from '../employees/employees.service';
export declare class CopilotController {
    private readonly copilotService;
    private readonly employeesService;
    constructor(copilotService: CopilotService, employeesService: EmployeesService);
    chat(user: any, message: string): Promise<{
        reply: string;
    }>;
    analyzeSpending(user: any, spendingData: string): Promise<{
        reply: string;
    }>;
    getPredictiveInsight(user: any, balance: number): Promise<{
        reply: string;
    }>;
    processVoiceCommand(user: any, text: string): Promise<{
        reply: string;
    }>;
    analyzeBillText(text: string): Promise<any>;
    planLeave(user: any, remainingDays: number, userRequest: string): Promise<{
        reply: string;
    }>;
}
