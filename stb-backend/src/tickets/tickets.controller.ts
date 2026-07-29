import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Body, 
  Param, 
  Query,
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { Ticket, TicketStatus } from './schemas/ticket.schema';
import { MessageSender } from './schemas/ticket-message.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('🎫 Tickets')
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // ── Create Ticket ────────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Create support ticket' })
  async create(@Request() req, @Body() data: Partial<Ticket>) {
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

  // ── Get Unread Count ─────────────────────────────────────────────
  @Get('my/unread-count')
  @ApiOperation({ summary: 'Get unread messages count' })
  @ApiQuery({ name: 'employeeId', required: false })
  async getUnreadCount(@Request() req, @Query('employeeId') employeeId?: string) {
    const userId = employeeId || req.user?.sub;
    const count = await this.ticketsService.getUnreadCount(userId);
    return { success: true, data: { count } };
  }

  // ── Get My Tickets ───────────────────────────────────────────────
  @Get('my')
  @ApiOperation({ summary: 'Get my tickets (Employee)' })
  @ApiQuery({ name: 'employeeId', required: false })
  async findMine(@Request() req, @Query('employeeId') employeeId?: string) {
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
    } else {
      console.log('✅ Tickets found:');
      tickets.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.subject} (${t.status}) - employeeId: ${t.employeeId}`);
      });
    }
    console.log('🎫 ========================================');
    
    return { success: true, data: tickets };
  }

  // ── Get All Tickets (RH) ─────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Get all tickets (RH)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'priority', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('priority') priority?: string,
  ) {
    const tickets = await this.ticketsService.findAll({ status, type, priority });
    return { success: true, data: tickets };
  }

  // ── Get Ticket by ID ─────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get ticket details' })
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketsService.findOne(id);
    return { success: true, data: ticket };
  }

  // ── Update Status ────────────────────────────────────────────────
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TicketStatus,
    @Request() req,
  ) {
    const rhId = req.user?.sub;
    const ticket = await this.ticketsService.updateStatus(id, status, rhId);
    return { success: true, data: ticket };
  }

  // ── Assign Ticket ────────────────────────────────────────────────
  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign ticket to RH' })
  async assign(@Param('id') id: string, @Request() req) {
    const rhId = req.user?.sub;
    const ticket = await this.ticketsService.assignTicket(id, rhId);
    return { success: true, data: ticket };
  }

  // ── Get Messages ─────────────────────────────────────────────────
  @Get(':id/messages')
  @ApiOperation({ summary: 'Get ticket messages' })
  async getMessages(@Param('id') id: string, @Request() req) {
    // Mark as read
    const userId = req.user?.sub;
    await this.ticketsService.markAsRead(id, userId);
    
    const messages = await this.ticketsService.getMessages(id);
    return { success: true, data: messages };
  }

  // ── Send Message ─────────────────────────────────────────────────
  @Post(':id/messages')
  @ApiOperation({ summary: 'Send message to ticket' })
  async sendMessage(
    @Param('id') id: string,
    @Body('message') message: string,
    @Body('senderType') senderType: MessageSender,
    @Request() req,
  ) {
    const senderId = req.user?.sub;
    const ticketMessage = await this.ticketsService.sendMessage(
      id,
      senderId,
      senderType || MessageSender.EMPLOYEE,
      message,
    );
    return { success: true, data: ticketMessage };
  }
}
