import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { Conversation } from './schemas/conversation.schema';

@ApiTags('💬 Conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create conversation' })
  create(@Body() data: Partial<Conversation>) {
    return this.conversationsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List conversations for employee' })
  findByParticipant(@Query('employeeId') employeeId: string) {
    return this.conversationsService.findByParticipant(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }

  @Patch(':id/last-message')
  @ApiOperation({ summary: 'Update last message' })
  updateLastMessage(@Param('id') id: string, @Body('preview') preview: string) {
    return this.conversationsService.updateLastMessage(id, preview);
  }
}
