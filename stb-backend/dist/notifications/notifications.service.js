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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const employee_schema_1 = require("../employees/employee.schema");
const employee_status_enum_1 = require("../common/enums/employee-status.enum");
let NotificationsService = class NotificationsService {
    notifModel;
    employeeModel;
    constructor(notifModel, employeeModel) {
        this.notifModel = notifModel;
        this.employeeModel = employeeModel;
    }
    async sendToEmployee(employeeId, title, body, type = notification_schema_1.NotificationType.SYSTEM, data = {}) {
        const employee = await this.employeeModel.findById(employeeId);
        const notif = new this.notifModel({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            title,
            body,
            type,
            data,
        });
        const savedNotif = await notif.save();
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
            }
            catch (err) {
                console.error('OneSignal Push Error:', err);
            }
        }
        return savedNotif;
    }
    async sendCustomNotification(dto) {
        if (dto.employeeId) {
            return this.sendToEmployee(dto.employeeId, dto.title, dto.body, dto.type);
        }
        const employees = await this.employeeModel.find({ status: employee_status_enum_1.EmployeeStatus.ACTIVE }).select('_id').exec();
        const notifs = employees.map(emp => ({
            employeeId: emp._id,
            title: dto.title,
            body: dto.body,
            type: dto.type,
        }));
        return this.notifModel.insertMany(notifs);
    }
    async getMyNotifications(employeeId) {
        return this.notifModel.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).limit(50).exec();
    }
    async getUnreadCount(employeeId) {
        return this.notifModel.countDocuments({ employeeId: new mongoose_2.Types.ObjectId(employeeId), isRead: false }).exec();
    }
    async markRead(id) {
        return this.notifModel.findByIdAndUpdate(id, { isRead: true }, { new: true }).exec();
    }
    async markAllRead(employeeId) {
        return this.notifModel.updateMany({ employeeId: new mongoose_2.Types.ObjectId(employeeId), isRead: false }, { isRead: true }).exec();
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map