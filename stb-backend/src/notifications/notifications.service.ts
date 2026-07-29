import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationType } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(Notification.name) private notifModel: Model<Notification>) {}

  async sendToEmployee(employeeId: string, title: string, body: string, type: NotificationType = NotificationType.SYSTEM, data: any = {}) {
    const notif = new this.notifModel({
      employeeId: new Types.ObjectId(employeeId),
      title,
      body,
      type,
      data,
    });
    return notif.save();
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
