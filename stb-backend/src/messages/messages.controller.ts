import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { Message } from './schemas/message.schema';

@ApiTags('💬 Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send message' })
  create(@Body() data: Partial<Message>) {
    return this.messagesService.create(data);
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Get messages by conversation' })
  findByConversation(@Param('conversationId') conversationId: string, @Query('page') page = 1, @Query('limit') limit = 50) {
    return this.messagesService.findByConversation(conversationId, +page, +limit);
  }

  @Patch('read/:conversationId')
  @ApiOperation({ summary: 'Mark messages as read' })
  markAsRead(@Param('conversationId') conversationId: string, @Body('recipientId') recipientId: string) {
    return this.messagesService.markAsRead(conversationId, recipientId);
  }
}
