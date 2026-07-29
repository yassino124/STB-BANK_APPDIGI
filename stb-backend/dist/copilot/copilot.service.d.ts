import { ConfigService } from '@nestjs/config';
export declare class CopilotService {
    private configService;
    private genAI;
    constructor(configService: ConfigService);
    chat(employee: any, message: string): Promise<string>;
}
