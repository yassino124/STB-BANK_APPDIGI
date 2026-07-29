import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { OtpDocument, OtpPurpose } from './otp.schema';
export declare class OtpService {
    private otpModel;
    private configService;
    private readonly logger;
    private transporter;
    constructor(otpModel: Model<OtpDocument>, configService: ConfigService);
    private generateCode;
    sendOtp(employeeId: string, purpose: OtpPurpose, email: string, phone?: string): Promise<{
        message: string;
        devCode?: string;
    }>;
    verifyOtp(employeeId: string, purpose: OtpPurpose, code: string): Promise<boolean>;
    private sendEmailOtp;
}
