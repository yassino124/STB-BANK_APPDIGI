import { Model } from 'mongoose';
import { DeviceDocument } from './device.schema';
export declare class DevicesService {
    private deviceModel;
    constructor(deviceModel: Model<DeviceDocument>);
    getMyDevices(employeeId: string): Promise<DeviceDocument[]>;
    removeDevice(employeeId: string, deviceId: string): Promise<{
        message: string;
    }>;
    revokeTrust(employeeId: string, deviceId: string): Promise<{
        message: string;
    }>;
}
