import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CopilotService } from './copilot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EmployeesService } from '../employees/employees.service';

@ApiTags('🤖 Copilot AI')
@Controller('copilot')
export class CopilotController {
  constructor(
    private readonly copilotService: CopilotService,
    private readonly employeesService: EmployeesService,
  ) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '💬 Chat with STB AI Assistant',
    description: 'Send a message to the Gemini-powered AI assistant. Context is automatically injected.',
  })
  async chat(@CurrentUser() user: any, @Body('message') message: string) {
    const employee = await this.employeesService.findOne(user.sub);
    const reply = await this.copilotService.chat(employee, message);
    return { reply };
  }

  @Post('analyze-spending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async analyzeSpending(@CurrentUser() user: any, @Body('spendingData') spendingData: string) {
    const employee = await this.employeesService.findOne(user.sub);
    const reply = await this.copilotService.analyzeSpending(employee, spendingData);
    return { reply };
  }

  @Post('predictive-insight')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getPredictiveInsight(@CurrentUser() user: any, @Body('balance') balance: number) {
    const employee = await this.employeesService.findOne(user.sub);
    const reply = await this.copilotService.getPredictiveInsight(employee, balance);
    return { reply };
  }

  @Post('voice-command')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async processVoiceCommand(@CurrentUser() user: any, @Body('text') text: string) {
    const employee = await this.employeesService.findOne(user.sub);
    const reply = await this.copilotService.processVoiceCommand(employee, text);
    return { reply };
  }

  @Post('analyze-bill')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async analyzeBillText(@Body('text') text: string) {
    // No employee context needed for simple OCR JSON parsing
    const result = await this.copilotService.analyzeBillText(text);
    return result; // Already returns an object
  }

  @Post('plan-leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async planLeave(@CurrentUser() user: any, @Body('remainingDays') remainingDays: number, @Body('userRequest') userRequest: string) {
    const employee = await this.employeesService.findOne(user.sub);
    const reply = await this.copilotService.planLeave(employee, remainingDays, userRequest);
    return { reply };
  }
}
