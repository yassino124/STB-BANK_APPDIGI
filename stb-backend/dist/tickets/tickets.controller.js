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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tickets_service_1 = require("./tickets.service");
const ticket_schema_1 = require("./schemas/ticket.schema");
const ticket_message_schema_1 = require("./schemas/ticket-message.schema");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TicketsController = class TicketsController {
    ticketsService;
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    async create(req, data) {
        const employeeId = data.employeeId || req.user?.sub;
        console.log('🎫 ============ CREATE TICKET ============');
        console.log('🔑 JWT User:', req.user);
        console.log('🆔 Employee ID:', employeeId);
        console.log('📝 Ticket data:', data);
        if (!employeeId) {
            console.log('❌ NO EMPLOYEE ID!');
            return {
                success: false,
                statusCode: 400,
                message: 'Employee ID required'
            };
        }
        const ticket = await this.ticketsService.create({ ...data, employeeId });
        console.log('✅ Ticket created:', ticket._id);
        console.log('📋 Ticket employeeId:', ticket.employeeId);
        console.log('🎫 ========================================');
        return { success: true, data: ticket };
    }
    async getUnreadCount(req, employeeId) {
        const userId = employeeId || req.user?.sub;
        const count = await this.ticketsService.getUnreadCount(userId);
        return { success: true, data: { count } };
    }
    async findMine(req, employeeId) {
        const userId = employeeId || req.user?.sub;
        console.log('🎫 ============ GET MY TICKETS ============');
        console.log('🔑 JWT User:', req.user);
        console.log('🆔 User ID (sub):', userId);
        console.log('📧 User email:', req.user?.email);
        const tickets = await this.ticketsService.findMyTickets(userId);
        console.log('📊 Found tickets:', tickets.length);
        if (tickets.length === 0) {
            console.log('⚠️  NO TICKETS FOUND!');
            console.log('🔍 Debugging: Check if tickets exist in DB');
        }
        else {
            console.log('✅ Tickets found:');
            tickets.forEach((t, i) => {
                console.log(`  ${i + 1}. ${t.subject} (${t.status}) - employeeId: ${t.employeeId}`);
            });
        }
        console.log('🎫 ========================================');
        return { success: true, data: tickets };
    }
    async findAll(status, type, priority) {
        const tickets = await this.ticketsService.findAll({ status, type, priority });
        return { success: true, data: tickets };
    }
    async findOne(id) {
        const ticket = await this.ticketsService.findOne(id);
        return { success: true, data: ticket };
    }
    async updateStatus(id, status, req) {
        const rhId = req.user?.sub;
        const ticket = await this.ticketsService.updateStatus(id, status, rhId);
        return { success: true, data: ticket };
    }
    async assign(id, req) {
        const rhId = req.user?.sub;
        const ticket = await this.ticketsService.assignTicket(id, rhId);
        return { success: true, data: ticket };
    }
    async getMessages(id, req) {
        const userId = req.user?.sub;
        await this.ticketsService.markAsRead(id, userId);
        const messages = await this.ticketsService.getMessages(id);
        return { success: true, data: messages };
    }
    async sendMessage(id, message, senderType, req) {
        const senderId = req.user?.sub;
        const ticketMessage = await this.ticketsService.sendMessage(id, senderId, senderType || ticket_message_schema_1.MessageSender.EMPLOYEE, message);
        return { success: true, data: ticketMessage };
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create support ticket' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my/unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread messages count' }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my tickets (Employee)' }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tickets (RH)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('priority')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign ticket to RH' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "assign", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket messages' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Send message to ticket' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('message')),
    __param(2, (0, common_1.Body)('senderType')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "sendMessage", null);
exports.TicketsController = TicketsController = __decorate([
    (0, swagger_1.ApiTags)('🎫 Tickets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tickets'),
    __metadata("design:paramtypes", [tickets_service_1.TicketsService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map