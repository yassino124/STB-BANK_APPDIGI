import { DevicesService } from './devices.service';
export declare class DevicesController {
    private readonly devicesService;
    constructor(devicesService: DevicesService);
    getMyDevices(employeeId: string): Promise<import("./device.schema").DeviceDocument[]>;
    removeDevice(employeeId: string, deviceId: string): Promise<{
        message: string;
    }>;
    revokeTrust(employeeId: string, deviceId: string): Promise<{
        message: string;
    }>;
}
