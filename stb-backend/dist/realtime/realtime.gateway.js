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
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const employee_schema_1 = require("../employees/employee.schema");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    jwtService;
    configService;
    employeeModel;
    notificationModel;
    server;
    logger = new common_1.Logger(RealtimeGateway_1.name);
    connectedUsers = new Map();
    constructor(jwtService, configService, employeeModel, notificationModel) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.employeeModel = employeeModel;
        this.notificationModel = notificationModel;
    }
    afterInit() {
        this.logger.log('WebSocket gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                this.logger.warn(`Client ${client.id} attempted connection without token`);
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
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
        }
        catch (error) {
            this.logger.warn(`Authentication failed for client ${client.id}: ${error.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.data.userId) {
            this.connectedUsers.delete(client.data.userId);
            this.logger.log(`User ${client.data.userId} disconnected`);
        }
    }
    handleJoinRoom(client, room) {
        client.join(room);
        this.logger.log(`Client ${client.id} joined room ${room}`);
        return { event: 'joined-room', data: { room } };
    }
    handleLeaveRoom(client, room) {
        client.leave(room);
        this.logger.log(`Client ${client.id} left room ${room}`);
        return { event: 'left-room', data: { room } };
    }
    async handleMessage(client, payload) {
        client.to(payload.room).emit('new-message', {
            userId: client.data.userId,
            message: payload.message,
            timestamp: new Date(),
        });
        return { event: 'message-sent', data: payload };
    }
    handleTyping(client, room) {
        client.to(room).emit('user-typing', { userId: client.data.userId });
    }
    async sendNotificationToUser(userId, notification) {
        const client = this.connectedUsers.get(userId);
        if (client) {
            client.emit('notification', notification);
            await this.notificationModel.findByIdAndUpdate(notification._id, { isRead: false }).exec();
        }
    }
    async sendNotificationToRole(role, notification) {
        this.server.to(role).emit('notification', notification);
    }
    async broadcastToAll(notification) {
        this.server.emit('notification', notification);
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
    listen(server) {
        const httpServer = server;
        this.logger.log('WebSocket gateway listening');
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-room'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send-message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleTyping", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    }),
    __param(2, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(3, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        mongoose_2.Model,
        mongoose_2.Model])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map