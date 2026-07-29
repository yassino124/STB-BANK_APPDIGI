import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument } from './device.schema';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async getMyDevices(employeeId: string): Promise<DeviceDocument[]> {
    return this.deviceModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ lastLoginAt: -1 })
      .exec();
  }

  async removeDevice(employeeId: string, deviceId: string): Promise<{ message: string }> {
    const device = await this.deviceModel.findOne({
      _id: deviceId,
      employeeId: new Types.ObjectId(employeeId),
    });

    if (!device) throw new NotFoundException('Appareil introuvable.');

    await this.deviceModel.deleteOne({ _id: deviceId });
    return { message: 'Appareil supprimé avec succès.' };
  }

  async revokeTrust(employeeId: string, deviceId: string): Promise<{ message: string }> {
    const device = await this.deviceModel.findOne({
      _id: deviceId,
      employeeId: new Types.ObjectId(employeeId),
    });

    if (!device) throw new NotFoundException('Appareil introuvable.');

    await this.deviceModel.updateOne({ _id: deviceId }, { trusted: false, biometricsEnabled: false });
    return { message: 'Confiance révoquée pour cet appareil.' };
  }
}
