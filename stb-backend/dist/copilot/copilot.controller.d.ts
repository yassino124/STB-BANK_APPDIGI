import { CopilotService } from './copilot.service';
import { EmployeesService } from '../employees/employees.service';
export declare class CopilotController {
    private readonly copilotService;
    private readonly employeesService;
    constructor(copilotService: CopilotService, employeesService: EmployeesService);
    chat(user: any, message: string): Promise<{
        reply: string;
    }>;
}
