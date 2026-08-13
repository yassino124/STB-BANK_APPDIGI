import { ConfigService } from '@nestjs/config';
export declare class CopilotService {
    private configService;
    private genAI;
    constructor(configService: ConfigService);
    chat(employee: any, message: string): Promise<string>;
    analyzeSpending(employee: any, spendingData: string): Promise<string>;
    getPredictiveInsight(employee: any, balance: number): Promise<string>;
    processVoiceCommand(employee: any, userSpokenText: string): Promise<string>;
    analyzeBillText(extractedText: string): Promise<any>;
    planLeave(employee: any, remainingDays: number, userRequest: string): Promise<string>;
}
