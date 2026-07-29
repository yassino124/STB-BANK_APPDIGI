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
}
