"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ticket_schema_1 = require("./schemas/ticket.schema");
const ticket_message_schema_1 = require("./schemas/ticket-message.schema");
let TicketsService = class TicketsService {
    ticketModel;
    messageModel;
    constructor(ticketModel, messageModel) {
        this.ticketModel = ticketModel;
        this.messageModel = messageModel;
    }
    async create(data) {
        const ticket = await this.ticketModel.create({
            ...data,
            messageCount: 1,
            lastMessageAt: new Date(),
        });
        await this.messageModel.create({
            ticketId: ticket._id,
            senderId: data.employeeId,
            senderType: ticket_message_schema_1.MessageSender.EMPLOYEE,
            message: data.message,
        });
        return ticket;
    }
    async findMyTickets(employeeId) {
        console.log('🔍 ============ FIND MY TICKETS ============');
        console.log('🔍 Looking for employeeId:', employeeId);
        console.log('🔍 Type:', typeof employeeId);
        let query = {};
        if (employeeId && mongoose_2.Types.ObjectId.isValid(employeeId)) {
            query = { $or: [{ employeeId: new mongoose_2.Types.ObjectId(employeeId) }, { employeeId: String(employeeId) }] };
        }
        else if (employeeId) {
            query = { employeeId: employeeId };
        }
        let tickets = await this.ticketModel
            .find(query)
            .sort({ lastMessageAt: -1 })
            .populate('employeeId', 'nom prenom email')
            .populate('assignedTo', 'nom prenom')
            .exec();
        console.log('📊 Tickets found for query:', tickets.length);
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
    async findAll(filters) {
        const query = {};
        if (filters?.status)
            query.status = filters.status;
        if (filters?.type)
            query.type = filters.type;
        if (filters?.priority)
            query.priority = filters.priority;
        return this.ticketModel
            .find(query)
            .sort({ lastMessageAt: -1 })
            .populate('employeeId', 'nom prenom email matricule')
            .populate('assignedTo', 'nom prenom')
            .exec();
    }
    async findOne(id) {
        const ticket = await this.ticketModel
            .findById(id)
            .populate('employeeId', 'nom prenom email matricule')
            .populate('assignedTo', 'nom prenom')
            .exec();
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return ticket;
    }
    async updateStatus(id, status, rhId) {
        const update = { status };
        if (status === ticket_schema_1.TicketStatus.RESOLVED) {
            update.resolvedAt = new Date();
        }
        if (status === ticket_schema_1.TicketStatus.CLOSED) {
            update.closedAt = new Date();
        }
        if (status === ticket_schema_1.TicketStatus.IN_PROGRESS && rhId) {
            update.assignedTo = new mongoose_2.Types.ObjectId(rhId);
        }
        const ticket = await this.ticketModel
            .findByIdAndUpdate(id, update, { new: true })
            .exec();
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return ticket;
    }
    async assignTicket(id, rhId) {
        const ticket = await this.ticketModel
            .findByIdAndUpdate(id, {
            assignedTo: new mongoose_2.Types.ObjectId(rhId),
            status: ticket_schema_1.TicketStatus.IN_PROGRESS
        }, { new: true })
            .exec();
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return ticket;
    }
    async getMessages(ticketId) {
        return this.messageModel
            .find({ ticketId: new mongoose_2.Types.ObjectId(ticketId) })
            .sort({ createdAt: 1 })
            .populate('senderId', 'nom prenom email')
            .exec();
    }
    async sendMessage(ticketId, senderId, senderType, message) {
        const ticketMessage = await this.messageModel.create({
            ticketId: new mongoose_2.Types.ObjectId(ticketId),
            senderId: new mongoose_2.Types.ObjectId(senderId),
            senderType,
            message,
        });
        await this.ticketModel.findByIdAndUpdate(ticketId, {
            $inc: { messageCount: 1 },
            lastMessageAt: new Date(),
            status: senderType === ticket_message_schema_1.MessageSender.RH
                ? ticket_schema_1.TicketStatus.WAITING_RESPONSE
                : ticket_schema_1.TicketStatus.IN_PROGRESS,
        });
        return ticketMessage;
    }
    async markAsRead(ticketId, userId) {
        await this.messageModel.updateMany({
            ticketId: new mongoose_2.Types.ObjectId(ticketId),
            senderId: { $ne: new mongoose_2.Types.ObjectId(userId) },
            isRead: false
        }, {
            isRead: true,
            readAt: new Date()
        });
    }
    async getUnreadCount(employeeId) {
        const tickets = await this.ticketModel
            .find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) })
            .select('_id')
            .exec();
        const ticketIds = tickets.map(t => t._id);
        const count = await this.messageModel.countDocuments({
            ticketId: { $in: ticketIds },
            senderId: { $ne: new mongoose_2.Types.ObjectId(employeeId) },
            isRead: false,
        });
        return count;
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ticket_schema_1.Ticket.name)),
    __param(1, (0, mongoose_1.InjectModel)(ticket_message_schema_1.TicketMessage.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map