import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '../common/enums/role.enum';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body('prompt') prompt: string, @Req() req: any) {
    const userRoles = req.user.roles || [Role.EMPLOYEE];
    return this.aiService.chat(prompt, userRoles);
  }

  @Post('approval-summary')
  async approvalSummary(
    @Body('type') type: 'LEAVE' | 'CREDIT',
    @Body('contextData') contextData: any,
  ) {
    return this.aiService.analyzeApproval(type, contextData);
  }

  @Post('execute')
  async executeAction(@Body() actionData: any, @Req() req: any) {
    return this.aiService.executeAction(actionData, req.user);
  }

  @Post('analyze-cv')
  async analyzeCv(@Body('cvText') cvText: string, @Body('jobDescription') jobDescription: string) {
    return this.aiService.analyzeCv(cvText, jobDescription);
  }

  @Post('fraud-alerts')
  async checkFraud() {
    return this.aiService.generateFraudAlerts();
  }

  @Post('mood')
  async getMoodMap() {
    return this.aiService.generateMoodMap();
  }
}
