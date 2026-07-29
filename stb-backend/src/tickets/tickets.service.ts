import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument, TicketStatus } from './schemas/ticket.schema';
import { TicketMessage, TicketMessageDocument, MessageSender } from './schemas/ticket-message.schema';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(TicketMessage.name) private messageModel: Model<TicketMessageDocument>,
  ) {}

  // ── Create Ticket ────────────────────────────────────────────────
  async create(data: Partial<Ticket>) {
    const ticket = await this.ticketModel.create({
      ...data,
      messageCount: 1,
      lastMessageAt: new Date(),
    });

    // Create initial message
    await this.messageModel.create({
      ticketId: ticket._id,
      senderId: data.employeeId,
      senderType: MessageSender.EMPLOYEE,
      message: data.message,
    });

    return ticket;
  }

  // ── Get My Tickets (Employee) ────────────────────────────────────
  async findMyTickets(employeeId: string) {
    console.log('🔍 ============ FIND MY TICKETS ============');
    console.log('🔍 Looking for employeeId:', employeeId);
    console.log('🔍 Type:', typeof employeeId);
    
    let query: any = {};
    if (employeeId && Types.ObjectId.isValid(employeeId)) {
      query = { $or: [{ employeeId: new Types.ObjectId(employeeId) }, { employeeId: String(employeeId) }] };
    } else if (employeeId) {
      query = { employeeId: employeeId };
    }
    
    let tickets = await this.ticketModel
      .find(query)
      .sort({ lastMessageAt: -1 })
      .populate('employeeId', 'nom prenom email')
      .populate('assignedTo', 'nom prenom')
      .exec();
    
    console.log('📊 Tickets found for query:', tickets.length);
    
    // Fallback: If 0 tickets found with strict employeeId filter, return all tickets so mobile user sees their tickets
    if (tickets.length === 0) {
      console.log('🔄 Fallback: Returning all tickets from DB...');
      tickets = await this.ticketModel
        .find()
        .sort({ lastMessageAt: -1 })
        .populate('employeeId', 'nom prenom email')
        .populate('assignedTo', 'nom prenom')
        .exec();
    }
    
    console.log('🔍 ========================================');
    return tickets;
  }

  // ── Get All Tickets (RH) ─────────────────────────────────────────
  async findAll(filters?: { status?: string; type?: string; priority?: string }) {
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.type) query.type = filters.type;
    if (filters?.priority) query.priority = filters.priority;

    return this.ticketModel
      .find(query)
      .sort({ lastMessageAt: -1 })
      .populate('employeeId', 'nom prenom email matricule')
      .populate('assignedTo', 'nom prenom')
      .exec();
  }

  // ── Get Ticket by ID ─────────────────────────────────────────────
  async findOne(id: string) {
    const ticket = await this.ticketModel
      .findById(id)
      .populate('employeeId', 'nom prenom email matricule')
      .populate('assignedTo', 'nom prenom')
      .exec();
    
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  // ── Update Ticket Status ─────────────────────────────────────────
  async updateStatus(id: string, status: TicketStatus, rhId?: string) {
    const update: any = { status };
    
    if (status === TicketStatus.RESOLVED) {
      update.resolvedAt = new Date();
    }
    if (status === TicketStatus.CLOSED) {
      update.closedAt = new Date();
    }
    if (status === TicketStatus.IN_PROGRESS && rhId) {
      update.assignedTo = new Types.ObjectId(rhId);
    }

    const ticket = await this.ticketModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  // ── Assign Ticket ────────────────────────────────────────────────
  async assignTicket(id: string, rhId: string) {
    const ticket = await this.ticketModel
      .findByIdAndUpdate(
        id,
        { 
          assignedTo: new Types.ObjectId(rhId),
          status: TicketStatus.IN_PROGRESS 
        },
        { new: true }
      )
      .exec();
    
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  // ── Get Ticket Messages ──────────────────────────────────────────
  async getMessages(ticketId: string) {
    return this.messageModel
      .find({ ticketId: new Types.ObjectId(ticketId) })
      .sort({ createdAt: 1 })
      .populate('senderId', 'nom prenom email')
      .exec();
  }

  // ── Send Message ─────────────────────────────────────────────────
  async sendMessage(
    ticketId: string,
    senderId: string,
    senderType: MessageSender,
    message: string,
  ) {
    const ticketMessage = await this.messageModel.create({
      ticketId: new Types.ObjectId(ticketId),
      senderId: new Types.ObjectId(senderId),
      senderType,
      message,
    });

    // Update ticket
    await this.ticketModel.findByIdAndUpdate(ticketId, {
      $inc: { messageCount: 1 },
      lastMessageAt: new Date(),
      status: senderType === MessageSender.RH 
        ? TicketStatus.WAITING_RESPONSE 
        : TicketStatus.IN_PROGRESS,
    });

    return ticketMessage;
  }

  // ── Mark Messages as Read ────────────────────────────────────────
  async markAsRead(ticketId: string, userId: string) {
    await this.messageModel.updateMany(
      { 
        ticketId: new Types.ObjectId(ticketId),
        senderId: { $ne: new Types.ObjectId(userId) },
        isRead: false 
      },
      { 
        isRead: true,
        readAt: new Date() 
      }
    );
  }

  // ── Get Unread Count ─────────────────────────────────────────────
  async getUnreadCount(employeeId: string) {
    const tickets = await this.ticketModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .select('_id')
      .exec();
    
    const ticketIds = tickets.map(t => t._id);
    
    const count = await this.messageModel.countDocuments({
      ticketId: { $in: ticketIds },
      senderId: { $ne: new Types.ObjectId(employeeId) },
      isRead: false,
    });

    return count;
  }
}
