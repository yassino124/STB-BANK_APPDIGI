import { Model } from 'mongoose';
import { QrPayment, QrPaymentDocument } from './schemas/qr-payment.schema';
export declare class QrPaymentsService {
    private qrPaymentModel;
    constructor(qrPaymentModel: Model<QrPaymentDocument>);
    create(data: Partial<QrPayment>): Promise<import("mongoose").Document<unknown, {}, QrPaymentDocument, {}, import("mongoose").DefaultSchemaOptions> & QrPayment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, QrPaymentDocument, {}, import("mongoose").DefaultSchemaOptions> & QrPayment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, QrPaymentDocument, {}, import("mongoose").DefaultSchemaOptions> & QrPayment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, QrPaymentDocument, {}, import("mongoose").DefaultSchemaOptions> & QrPayment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
