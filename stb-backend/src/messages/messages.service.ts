import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  async create(data: Partial<Message>) {
    return this.messageModel.create(data);
  }

  async findByConversation(conversationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return this.messageModel.find({ conversationId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }

  async markAsRead(conversationId: string, recipientId: string) {
    return this.messageModel.updateMany({ conversationId, recipientId, isRead: false }, { isRead: true, readAt: new Date() }).exec();
  }

  async findUnreadCount(employeeId: string) {
    return this.messageModel.countDocuments({ recipientId: employeeId, isRead: false }).exec();
  }
}
