import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Employee } from '../employees/employee.schema';
import { Notification } from '../notifications/schemas/notification.schema';
export declare class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    private employeeModel;
    private notificationModel;
    server: Server;
    private readonly logger;
    private readonly connectedUsers;
    constructor(jwtService: JwtService, configService: ConfigService, employeeModel: Model<Employee>, notificationModel: Model<Notification>);
    afterInit(): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, room: string): {
        event: string;
        data: {
            room: string;
        };
    };
    handleLeaveRoom(client: Socket, room: string): {
        event: string;
        data: {
            room: string;
        };
    };
    handleMessage(client: Socket, payload: {
        room: string;
        message: string;
    }): Promise<{
        event: string;
        data: {
            room: string;
            message: string;
        };
    }>;
    handleTyping(client: Socket, room: string): void;
    sendNotificationToUser(userId: string, notification: any): Promise<void>;
    sendNotificationToRole(role: string, notification: any): Promise<void>;
    broadcastToAll(notification: any): Promise<void>;
    getConnectedUsersCount(): number;
    isUserOnline(userId: string): boolean;
    listen(server: any): void;
}
