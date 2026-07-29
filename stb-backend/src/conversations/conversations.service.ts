import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';

@Injectable()
export class ConversationsService {
  constructor(@InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>) {}

  async create(data: Partial<Conversation>) {
    return this.conversationModel.create(data);
  }

  async findByParticipant(employeeId: string) {
    return this.conversationModel.find({ participants: employeeId, isActive: true }).sort({ lastMessageAt: -1 }).exec();
  }

  async findOne(id: string) {
    const conversation = await this.conversationModel.findById(id).exec();
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async updateLastMessage(id: string, preview: string) {
    return this.conversationModel.findByIdAndUpdate(id, { lastMessageAt: new Date(), lastMessagePreview: preview }, { new: true }).exec();
  }
}
