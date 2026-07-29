import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee } from '../employees/employee.schema';
import { Notification } from '../notifications/schemas/notification.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly connectedUsers = new Map<string, Socket>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  afterInit() {
    this.logger.log('WebSocket gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn(`Client ${client.id} attempted connection without token`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      const employee = await this.employeeModel.findById(payload.sub).exec();
      if (!employee) {
        this.logger.warn(`Client ${client.id} attempted connection with invalid user`);
        client.disconnect();
        return;
      }

      client.data.userId = payload.sub;
      client.data.userRoles = payload.roles;
      this.connectedUsers.set(payload.sub, client);

      this.logger.log(`User ${payload.sub} connected (${client.id})`);
      
      client.emit('connected', { message: 'Connected to STB real-time server', userId: payload.sub });
      
      client.join(`user:${payload.sub}`);
      if (payload.roles?.includes('RH') || payload.roles?.includes('ADMIN') || payload.roles?.includes('SUPER_ADMIN')) {
        client.join('admin');
      }
    } catch (error) {
      this.logger.warn(`Authentication failed for client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);
      this.logger.log(`User ${client.data.userId} disconnected`);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'joined-room', data: { room } };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { event: 'left-room', data: { room } };
  }

  @SubscribeMessage('send-message')
  async handleMessage(client: Socket, payload: { room: string; message: string }) {
    client.to(payload.room).emit('new-message', {
      userId: client.data.userId,
      message: payload.message,
      timestamp: new Date(),
    });
    return { event: 'message-sent', data: payload };
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, room: string) {
    client.to(room).emit('user-typing', { userId: client.data.userId });
  }

  async sendNotificationToUser(userId: string, notification: any) {
    const client = this.connectedUsers.get(userId);
    if (client) {
      client.emit('notification', notification);
      await this.notificationModel.findByIdAndUpdate(notification._id, { isRead: false }).exec();
    }
  }

  async sendNotificationToRole(role: string, notification: any) {
    this.server.to(role).emit('notification', notification);
  }

  async broadcastToAll(notification: any) {
    this.server.emit('notification', notification);
  }

  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  listen(server: any) {
    const httpServer = server;
    this.logger.log('WebSocket gateway listening');
  }
}
