import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationType } from './schemas/notification.schema';
import { SendNotificationDto } from './dto/send-notification.dto';
import { Employee } from '../employees/employee.schema';
import { EmployeeStatus } from '../common/enums/employee-status.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notifModel: Model<Notification>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>
  ) {}

  async sendToEmployee(employeeId: string, title: string, body: string, type: NotificationType = NotificationType.SYSTEM, data: any = {}) {
    const employee = await this.employeeModel.findById(employeeId);
    
    const notif = new this.notifModel({
      employeeId: new Types.ObjectId(employeeId),
      title,
      body,
      type,
      data,
    });
    const savedNotif = await notif.save();

    // 🔔 Push to OneSignal
    if (employee && process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY) {
      try {
        await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
          },
          body: JSON.stringify({
            app_id: process.env.ONESIGNAL_APP_ID,
            include_aliases: {
              external_id: [employee.matricule]
            },
            target_channel: 'push',
            headings: { "en": title, "fr": title },
            contents: { "en": body, "fr": body },
            data: data
          })
        });
      } catch (err) {
        console.error('OneSignal Push Error:', err);
      }
    }
    
    return savedNotif;
  }

  async sendCustomNotification(dto: SendNotificationDto) {
    if (dto.employeeId) {
      return this.sendToEmployee(dto.employeeId, dto.title, dto.body, dto.type);
    }
    
    // Envoyer à tous les employés actifs
    const employees = await this.employeeModel.find({ status: EmployeeStatus.ACTIVE }).select('_id').exec();
    const notifs = employees.map(emp => ({
      employeeId: emp._id,
      title: dto.title,
      body: dto.body,
      type: dto.type,
    }));
    
    return this.notifModel.insertMany(notifs);
  }

  async getMyNotifications(employeeId: string) {
    return this.notifModel.find({ employeeId: new Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).limit(50).exec();
  }

  async getUnreadCount(employeeId: string) {
    return this.notifModel.countDocuments({ employeeId: new Types.ObjectId(employeeId), isRead: false }).exec();
  }

  async markRead(id: string) {
    return this.notifModel.findByIdAndUpdate(id, { isRead: true }, { new: true }).exec();
  }

  async markAllRead(employeeId: string) {
    return this.notifModel.updateMany({ employeeId: new Types.ObjectId(employeeId), isRead: false }, { isRead: true }).exec();
  }
}
